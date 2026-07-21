"""Fetch and normalize the additional drink catalogue artwork.

The URLs are kept here to make the prototype's image provenance reproducible.
Run this script from the repository root.
"""

from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from pathlib import Path
from urllib.request import Request, urlopen

from PIL import Image


SOURCES = {
    "fanta-orange": "https://toppng.com/uploads/preview/fanta-food-png-image-1166734367284scn3xfab.png",
    "dr-pepper": "https://cdn1.hospitalgiftshop.com/hgs-img/products/loris/pepsico/078000082401.jpg",
    "sanpellegrino-limonata": "https://www.whitehorsewine.com/cdn/shop/products/sanpellegrino_sparkling_fruit_beverages_limonata_33cl_can_single.jpg?v=1464721621",
    "club-mate": "https://clubmate-australia.com.au/wp-content/uploads/2021/05/Club-Mate_original_330.png",
    "irn-bru": "https://www.buy-british.ph/cdn/shop/files/IRN-BRU330ml1.avif?format=webp&v=1765351760&width=1445",
    "sierra-nevada-pale-ale": "https://norfolkwineandspirits.com/wp-content/uploads/2022/09/sierra-nevada-pale-ale-12-oz-bottled-1000x1000-1.jpg",
    "peroni": "https://ww1.valuecellars.com.au/files/2016/05/9320000180467-1.png",
    "punk-ipa": "https://www.mchughs.ie/image/cache/catalog/products/Beers/BrewDog-Punk-IPA-1000x1000.jpg",
    "corona-extra": "https://upload.wikimedia.org/wikipedia/commons/0/04/Corona_Extra_beer_bottle_%282019%29.png",
    "asahi-super-dry": "https://asiabrewery.com/cdn/shop/files/Asahi-330ml-Can_1600x.jpg?v=1704270025",
    "mojito": "https://thenovicechefblog.com/wp-content/uploads/2021/02/Mojito-1.jpg",
    "negroni": "https://insanelygoodrecipes.com/wp-content/uploads/2023/11/Homemade-Iced-Negroni-Cocktail-in-a-Glass.jpg",
    "old-fashioned": "https://www.simplyrecipes.com/thmb/pXmIaRJ7P0G7Izo6VpOxoZJC9Zc=/960x0/filters:no_upscale():max_bytes(150000):strip_icc()/__opt__aboutcom__coeus__resources__content_migration__simply_recipes__uploads__2020__01__Old-Fashioned-Cocktail-LEAD-1-d1f215fa53e644758cc93a219e0dc468.jpg",
    "paloma": "https://insanelygoodrecipes.com/wp-content/uploads/2024/02/Paloma-Cocktail-in-Glasses.jpg",
    "french-75": "https://cdn.loveandlemons.com/wp-content/uploads/2023/12/french-75.jpg",
    "cloudy-bay-sauvignon": "https://www.thebottleclub.com/cdn/shop/files/cloudy-bay-sauvignon-blanc-2019-75-cl-white-wine-14477078855795.png?v=1702058732",
    "rioja-reserva": "https://winetrust.co.uk/wp-content/uploads/2024/12/La-Rioja-Alta-Vina-Alberdi-Rioja-Reserva.png",
    "barolo": "https://www.wine.com/product/images/w_600,h_600,dpr_2.0,c_fit,q_auto:good,fl_progressive/hksigid2s1mglvedc4xt.jpg",
    "sancerre": "https://www.totalwine.com/dynamic/x1000,sq/images/245463750/245463750-1-fr.png",
    "mendoza-malbec": "https://www.tri-vin.com/Admin/Public/GetImage.ashx?Width=1690&Height=3840&Crop=5&DoNotUpscale=False&FillCanvas=True&Resolution=300&Compression=50&Image=/Files/Images/Assets/Bottleshots/PA2850-2021_1.png&AlternativeImage=%2fFiles%2fImages%2fmissing_image2.jpg",
    "flat-white": "https://d2lswn7b0fl4u2.cloudfront.net/photos/pg-a-cup-of-flat-white-coffee-1630845655.jpg",
    "cold-brew": "https://www.simplyrecipes.com/thmb/7zYXgL4vpOhXfa04v7_vPO4Dv84=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Simply-Recipes-Cold-Brew-Coffee-LEAD-6-896c6872ac3e421ca4d88f29b528b349.jpg",
    "cappuccino": "https://cdn.pixabay.com/photo/2024/01/12/15/05/coffee-8504106_1280.jpg",
    "iced-americano": "https://kitchenpedia.org/wp-content/uploads/2025/01/Iced_Americano.jpg",
    "mocha": "https://www.everyday-delicious.com/wp-content/uploads/2021/05/caffee-mocha-kawa-mokka-everyday-delicious-1-1197x1800.jpg",
    "earl-grey": "https://cdn.shopify.com/s/files/1/0522/1780/6999/articles/Earl_Grey-02_1000x1000.jpg?v=1620819630",
    "masala-chai": "https://www.foodandwine.com/thmb/hdSDHCy5cInPIDcGw0elAghHfnw=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/masala-chai-FT-RECIPE0921-b0aedd4ea09c41e3a11a3cc8ba0ce0bf.jpg",
    "jasmine-green-tea": "https://www.dibha.com/wp-content/uploads/2022/12/1-32-5-1024x1024.png",
    "peach-iced-tea": "https://www.sweetsteep.com/wp-content/uploads/2025/07/peach-iced-tea-1-683x1024.jpg",
    "genmaicha": "https://www.eyesandhour.com/wp-content/uploads/2024/09/pourgenmaicha.jpg",
    "jameson": "https://p7.hiclipart.com/preview/546/428/36/jameson-irish-whiskey-grain-whisky-distilled-beverage-bottle.jpg",
    "glenfiddich-12": "https://www.glenfiddich.com/sites/default/files/2022-05/GLEN_12YO-min_5.png",
    "makers-mark": "https://www.vhv.rs/dpng/d/212-2122638_makers-mark-bourbon-png-transparent-png.png",
    "nikka-from-the-barrel": "https://boozeshop.ph/cdn/shop/files/NikkafromtheBarrel500ml-New.jpg?v=1750237211&width=1445",
    "redbreast-12": "https://www.totalwine.com/dynamic/x1000,sq/images/97340750/97340750-1-fr.png",
    "ginger-lemon-kombucha": "https://www.organics.ph/cdn/shop/products/remedy-organic-kombucha-ginger-lemon-330ml-bottle-drinks-silverwave-corporation-549294_800x.jpg?v=1665485390",
    "mango-lassi": "https://www.theloveofspice.com/wp-content/uploads/2020/04/mango-lassi-recipe.jpg",
    "sparkling-mineral-water": "https://s3.amazonaws.com/grocery-project/product_images/sparkling-mineral-water-6763737-3.jpeg",
    "horchata": "https://www.cookingclassy.com/wp-content/uploads/2019/04/Horchata-8.jpg",
    "ginger-beer": "https://cdn-prd-02.pnp.co.za/sys-master/images/hbb/hc5/13164465815582/silo-product-image-v2-10Jul2025-180052-6009602372649-Straight_on-334478-929_515Wx515H",
}


def fetch_one(item: tuple[str, str]) -> tuple[str, str]:
    drink_id, url = item
    output = Path("assets/drinks/catalog") / f"{drink_id}.png"
    if output.exists():
        return drink_id, url
    request = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Saturated catalogue prototype)",
            "Accept": "image/avif,image/webp,image/png,image/jpeg,*/*;q=0.8",
        },
    )
    with urlopen(request, timeout=25) as response:
        data = response.read(25_000_000)
    with Image.open(BytesIO(data)) as source:
        source.load()
        image = source.convert("RGBA" if source.mode in {"RGBA", "LA", "P"} else "RGB")
        image.thumbnail((900, 900), Image.Resampling.LANCZOS)
        output.parent.mkdir(parents=True, exist_ok=True)
        image.save(output, "PNG", optimize=True)
    return drink_id, url


def main() -> None:
    failures: list[tuple[str, str]] = []
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(fetch_one, item): item for item in SOURCES.items()}
        for future in as_completed(futures):
            drink_id, url = futures[future]
            try:
                future.result()
                print(f"OK {drink_id}")
            except Exception as error:  # keeps the rest of the catalogue moving
                failures.append((drink_id, str(error)))
                print(f"FAILED {drink_id}: {error}")
    if failures:
        raise SystemExit(f"{len(failures)} image(s) failed: {failures}")


if __name__ == "__main__":
    main()
