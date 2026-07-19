import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Boldonse_400Regular,
  useFonts as useBoldonse,
} from "@expo-google-fonts/boldonse";
import {
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
  useFonts as useDMSans,
} from "@expo-google-fonts/dm-sans";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import {
  Apple,
  ArrowLeftCircle,
  Edit3,
  Filter,
  Globe,
  Heart,
  Mail,
  MessageCircle,
  Search,
  Settings,
  Share2,
  Star,
  UserPlus,
  Users,
  X,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import Svg, {
  Circle,
  Defs,
  Polygon,
  RadialGradient as SvgRadialGradient,
  Stop,
} from "react-native-svg";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  ImageSourcePropType,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const C = {
  red: "#cc242c",
  teal: "#2b4959",
  green: "#04b264",
  ink: "#201a1b",
  cream: "#fffef8",
  gold: "#ffd700",
};
const F = {
  display: "Boldonse",
  regular: "DMSans",
  medium: "DMSansMedium",
  bold: "DMSansBold",
};

const STORAGE_KEY = "saturated-state-v5";
const FIGMA_FRAME_WIDTH = 441;
const FIGMA_FRAME_HEIGHT = 918;

type Drink = {
  id: string;
  name: string;
  type: string;
  typeColor: string;
  image: ImageSourcePropType;
  rating: number;
  tags: string[];
  description: string;
  origin?: string;
  brand?: string;
};
type Review = {
  id: string;
  drinkId: string;
  user: string;
  avatar: ImageSourcePropType;
  rating: number;
  text: string;
  tags: string[];
  date: string;
  likes: number;
  comments: number;
};
type SearchProfile = {
  id: string;
  name: string;
  handle: string;
  detail: string;
  avatar: ImageSourcePropType;
};
type Screen =
  | "splash"
  | "explore"
  | "search"
  | "drinklist"
  | "drink"
  | "profile"
  | "review"
  | "feed";

const drinks: Drink[] = [
  {
    id: "aperol",
    name: "Aperol Spritz",
    type: "Cocktail",
    typeColor: "#aa0cac",
    rating: 4.1,
    tags: ["Citrus", "Refreshing"],
    origin: "Italy",
    brand: "Aperol",
    description:
      "Aperol Spritz is a bright and bubbly Italian cocktail, perfect for sunny afternoons. It's a refreshing mix of bittersweet flavors that instantly lifts your spirits.",
    image: require("./assets/drinks/aperol.png"),
  },
  {
    id: "sprite",
    name: "Sprite",
    type: "Soft Drink",
    typeColor: "#2903c0",
    rating: 3.8,
    tags: ["Refreshing", "Fizzy"],
    description:
      "A crisp lemon-lime soft drink with a clean, refreshing finish.",
    image: require("./assets/drinks/sprite.png"),
  },
  {
    id: "coke",
    name: "Coca-Cola",
    type: "Soft Drink",
    typeColor: "#2903c0",
    rating: 4.0,
    tags: ["Fizzy", "Sweet"],
    description:
      "The unmistakable sparkling cola with caramel and citrus notes.",
    image: require("./assets/drinks/coca-cola.png"),
  },
  {
    id: "heineken",
    name: "Heineken",
    type: "Beer",
    typeColor: "#84791b",
    rating: 4.0,
    tags: ["Mild", "Crisp"],
    description: "A balanced pale lager with a subtly bitter finish.",
    image: require("./assets/drinks/heineken.png"),
  },
  {
    id: "pilsner",
    name: "Pilsner Urquell",
    type: "Beer",
    typeColor: "#84791b",
    rating: 4.5,
    tags: ["Crisp", "Bitter"],
    description: "The original golden pilsner with a floral hop aroma.",
    image: require("./assets/drinks/pilsner.png"),
  },
  {
    id: "margarita",
    name: "Margarita",
    type: "Cocktail",
    typeColor: "#aa0cac",
    rating: 4.2,
    tags: ["Citrusy", "Tangy"],
    description: "Tequila, lime and orange liqueur served bright and cold.",
    image: require("./assets/drinks/margarita.png"),
  },
  {
    id: "hophouse",
    name: "Hop House Lager",
    type: "Beer",
    typeColor: "#84791b",
    rating: 4.3,
    tags: ["Mild", "Bitter"],
    description: "A double-hopped lager with a crisp, aromatic profile.",
    image: require("./assets/drinks/hop-house.png"),
  },
  {
    id: "guinness",
    name: "Guinness Draught",
    type: "Beer",
    typeColor: "#84791b",
    rating: 4.6,
    tags: ["Creamy", "Roasted"],
    description: "Iconic stout with roasted notes and a smooth creamy head.",
    image: require("./assets/drinks/guinness.png"),
  },
  {
    id: "petrus",
    name: "Château Petrus",
    type: "Wine",
    typeColor: "#9c0000",
    rating: 4.9,
    tags: ["Dry", "Rich"],
    origin: "France",
    brand: "Petrus",
    description:
      "A celebrated Pomerol with plush dark fruit and a long, elegant finish.",
    image: require("./assets/drinks/petrus.png"),
  },
  {
    id: "birra",
    name: "Birra Moretti",
    type: "Beer",
    typeColor: "#84791b",
    rating: 5,
    tags: ["Crisp", "Balanced"],
    description: "A traditionally brewed Italian lager.",
    image: require("./assets/drinks/birra.png"),
  },
  {
    id: "sevenup",
    name: "7 Up",
    type: "Soft Drink",
    typeColor: "#2903c0",
    rating: 3.7,
    tags: ["Citrus", "Fizzy"],
    description: "A light lemon-lime soda with an upbeat, sparkling finish.",
    image: require("./assets/drinks/seven-up.png"),
  },
  {
    id: "cosmo",
    name: "Cosmopolitan",
    type: "Cocktail",
    typeColor: "#aa0cac",
    rating: 4.2,
    tags: ["Tarty", "Fruity"],
    description: "A bright cranberry and citrus cocktail.",
    image: require("./assets/drinks/cosmopolitan.png"),
  },
  {
    id: "espresso",
    name: "Espresso Martini",
    type: "Cocktail",
    typeColor: "#aa0cac",
    rating: 4.7,
    tags: ["Strong", "Coffee"],
    description: "A rich, chilled combination of espresso and vodka.",
    image: require("./assets/drinks/espresso-martini.png"),
  },
  {
    id: "rose",
    name: "Whispering Angel",
    type: "Wine",
    typeColor: "#9c0000",
    rating: 4.4,
    tags: ["Dry", "Floral"],
    description: "Elegant Provence rosé with delicate fruit notes.",
    image: require("./assets/drinks/whispering-angel.png"),
  },
  {
    id: "cortado",
    name: "Cortado",
    type: "Coffee",
    typeColor: "#a4600d",
    rating: 4.5,
    tags: ["Creamy", "Strong"],
    description: "Equal parts espresso and warm steamed milk.",
    image: require("./assets/drinks/cortado.png"),
  },
  {
    id: "matcha",
    name: "White Choc Matcha",
    type: "Tea Latte",
    typeColor: "#7cb100",
    rating: 4.3,
    tags: ["Creamy", "Sweet"],
    description: "Ceremonial matcha softened with white chocolate.",
    image: require("./assets/drinks/matcha.png"),
  },
];

const exploreOrder = [
  "sprite",
  "coke",
  "heineken",
  "pilsner",
  "margarita",
  "hophouse",
  "guinness",
  "petrus",
  "birra",
  "sevenup",
  "cosmo",
  "espresso",
  "rose",
  "cortado",
  "matcha",
];
const exploreDrinks = exploreOrder
  .map((id) => drinks.find((drink) => drink.id === id))
  .filter((drink): drink is Drink => Boolean(drink));

const initialReviews: Review[] = [
  {
    id: "r1",
    drinkId: "aperol",
    user: "Gabby Romero",
    avatar: require("./assets/people/gabby.png"),
    rating: 5,
    text: "The light and effervescent combination of orange flavored bittersweet liqueur, sparkling wine, and club soda is a sunset in a cup.",
    tags: ["Citrus", "Refreshing"],
    date: "20 Jun 2026",
    likes: 8,
    comments: 2,
  },
  {
    id: "r2",
    drinkId: "aperol",
    user: "Liam Harper",
    avatar: require("./assets/people/liam.png"),
    rating: 4,
    text: "Ordered it because everyone else was drinking one. Stayed for the bittersweet orange kick and ended up ordering a second.",
    tags: ["Zesty", "Invigorating"],
    date: "3 May 2026",
    likes: 6,
    comments: 7,
  },
  {
    id: "r3",
    drinkId: "birra",
    user: "Mark Kelly",
    avatar: require("./assets/people/mark.png"),
    rating: 5,
    text: "Unlike Heineken, it has good texture. On a good day I could get drunk with just one pint of it.",
    tags: ["Crisp"],
    date: "15 Jun 2026",
    likes: 3,
    comments: 1,
  },
];

const searchableProfiles: SearchProfile[] = [
  {
    id: "mark",
    name: "Mark Kelly",
    handle: "@markkelly",
    detail: "12 drinks tried · 8 reviews",
    avatar: require("./assets/people/mark.png"),
  },
  {
    id: "gabby",
    name: "Gabby Romero",
    handle: "@gabbyromero",
    detail: "Cocktails, citrus and spritzes",
    avatar: require("./assets/people/gabby.png"),
  },
  {
    id: "liam",
    name: "Liam Harper",
    handle: "@liamharper",
    detail: "Beer and lager explorer",
    avatar: require("./assets/people/liam.png"),
  },
  {
    id: "sarah",
    name: "Sarah Chen",
    handle: "@sarahsips",
    detail: "Coffee, tea and everything fizzy",
    avatar: require("./assets/people/sarah.png"),
  },
];

const glass = {
  backgroundColor: "rgba(4,178,100,.15)",
  borderColor: "rgba(255,255,255,.7)",
  borderWidth: 1,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 5,
  shadowOffset: { width: 0, height: 4 },
  elevation: 5,
} as const;

function Background({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <LinearGradient colors={["#fafff2", "#effff6", "#edfffb"]} style={s.bg} />
      <DeviceStatusBar />
      {children}
    </SafeAreaView>
  );
}
function DeviceStatusBar() {
  if (Platform.OS !== "web") return null;
  return (
    <View style={s.deviceStatusBar}>
      <Text style={s.deviceStatusText}>9:41</Text>
      <Text style={s.deviceStatusText}>▮▮▮ ◉ ▱</Text>
    </View>
  );
}
function Heading({
  children,
  back,
  onBack,
}: {
  children: string;
  back?: boolean;
  onBack?: () => void;
}) {
  return (
    <View style={s.heading}>
      {back && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={onBack}
        >
          <ArrowLeftCircle size={38} color={C.ink} />
        </Pressable>
      )}
      <Text style={s.headingText}>{children}</Text>
    </View>
  );
}
function Pill({
  children,
  selected = false,
  onPress,
  color = C.teal,
}: {
  children: string;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
}) {
  const redTint = color.toLowerCase() === "#960000";
  const selectedFill =
    color === C.green ? "rgba(4,178,100,.18)" : "rgba(255,119,125,.3)";
  return (
    <Pressable
      accessibilityRole={onPress ? "button" : undefined}
      accessibilityLabel={onPress ? children : undefined}
      onPress={onPress}
      style={[
        s.pill,
        redTint && {
          backgroundColor: "rgba(255,119,125,.3)",
          borderColor: "rgba(150,0,0,.54)",
        },
        selected && { backgroundColor: selectedFill, borderColor: color },
      ]}
    >
      <Text style={[s.tiny, { color }]}>{children}</Text>
    </Pressable>
  );
}
function Rating({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center" }}>
      <Text style={{ color: C.gold, fontSize: size, letterSpacing: 1 }}>
        {"★".repeat(Math.floor(value))}
        {value % 1 ? "☆" : ""}
      </Text>
      <Text style={[s.body, { marginLeft: 5 }]}>{value.toFixed(1)}</Text>
    </View>
  );
}

function HalfStarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const size = 35;
  return (
    <View style={s.starPicker}>
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = Math.max(0, Math.min(1, value - (star - 1)));
        return (
          <View key={star} style={{ width: size, height: size }}>
            <Star size={size} color={C.red} fill="transparent" />
            <View
              pointerEvents="none"
              style={[s.halfStarFill, { width: size * fill }]}
            >
              <Star
                size={size}
                color={C.red}
                fill={C.red}
                style={s.filledStar}
              />
            </View>
            <View style={s.halfStarHitArea}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Rate ${star - 0.5} stars`}
                onPress={() => onChange(star - 0.5)}
                style={s.halfStarButton}
              />
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Rate ${star} stars`}
                onPress={() => onChange(star)}
                style={s.halfStarButton}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

function BottomNav({
  active,
  onGo,
}: {
  active: string;
  onGo: (x: Screen) => void;
}) {
  return (
    <BlurView intensity={55} tint="light" style={s.nav}>
      <View style={s.navTint} />
      {(["explore", "drinklist", "profile"] as Screen[]).map((x) => (
        <Pressable
          key={x}
          accessibilityRole="button"
          accessibilityLabel={`Go to ${x}`}
          onPress={() => onGo(x)}
          style={[s.navItem, active === x && s.navActive]}
        >
          <Text style={[s.navText, active === x && { color: "#fff" }]}>
            {x[0].toUpperCase() + x.slice(1)}
          </Text>
        </Pressable>
      ))}
    </BlurView>
  );
}

function Onboarding({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone: (name: string) => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [accountMode, setAccountMode] = useState<"social" | "email" | "create">(
    "social",
  );
  const finishEmail = () => {
    if (!email.trim() || !email.includes("@"))
      return Alert.alert("Valid email required");
    if (accountMode === "create" && !name.trim())
      return Alert.alert("Name required");
    onDone(name.trim() || email.split("@")[0] || "Saturated User");
  };
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={s.modalWrap}>
        <BlurView intensity={80} tint="light" style={s.onboard}>
          <View style={s.handle} />
          <Text style={s.onboardTitle}>Welcome to Saturated</Text>
          <Text style={s.onboardAge}>You must be 21+ to continue</Text>
          <Text style={s.onboardCopy}>
            Your age will be verified from the date-of-birth information linked
            to your Google or Apple account. Saturated never displays it.
          </Text>
          {accountMode === "social" ? (
            <>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with Google"
                style={s.socialButton}
                onPress={() => onDone("Mark Kelly")}
              >
                <Globe size={20} color="#4285f4" />
                <Text style={s.socialButtonText}>Continue with Google</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with Apple"
                style={[s.socialButton, s.socialButtonDark]}
                onPress={() => onDone("Mark Kelly")}
              >
                <Apple size={21} color="#fff" fill="#fff" />
                <Text style={[s.socialButtonText, { color: "#fff" }]}>
                  Continue with Apple
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Continue with email"
                style={s.socialButton}
                onPress={() => setAccountMode("email")}
              >
                <Mail size={20} color={C.teal} />
                <Text style={s.socialButtonText}>Continue with email</Text>
              </Pressable>
            </>
          ) : (
            <>
              {accountMode === "create" && (
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Your name"
                  placeholderTextColor="rgba(32,26,27,.45)"
                  style={s.input}
                />
              )}
              <TextInput
                autoFocus
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="Email address"
                placeholderTextColor="rgba(32,26,27,.45)"
                style={s.input}
              />
              <Pressable
                style={s.primary}
                accessibilityRole="button"
                accessibilityLabel={
                  accountMode === "create" ? "Create account" : "Sign in"
                }
                onPress={finishEmail}
              >
                <Text style={s.primaryText}>
                  {accountMode === "create" ? "Create account" : "Sign in"}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Back to sign in options"
                onPress={() => setAccountMode("social")}
                style={s.textButton}
              >
                <Text style={s.textButtonText}>Back to sign in options</Text>
              </Pressable>
            </>
          )}
          {accountMode !== "create" && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Create an account"
              style={s.createAccountButton}
              onPress={() => setAccountMode("create")}
            >
              <UserPlus size={18} color={C.red} />
              <Text style={s.createAccountText}>Create an account</Text>
            </Pressable>
          )}
        </BlurView>
      </View>
    </Modal>
  );
}

function Splash() {
  return (
    <View style={s.splash}>
      <StatusBar style="light" />
      <Image
        source={require("./assets/splash.png")}
        style={StyleSheet.absoluteFill}
      />
      <View style={s.splashShade} />
      <DeviceStatusBar />
      <Text style={s.splashTitle}>Saturated</Text>
    </View>
  );
}

function Explore({
  onOpen,
  onToggle,
  onGo,
}: {
  onOpen: (d: Drink) => void;
  onToggle: (id: string) => void;
  onGo: (s: Screen) => void;
}) {
  const [filter, setFilter] = useState("All");
  const filterOptions = [
    "All",
    "Soft Drink",
    "Beer",
    "Cocktail",
    "Wine",
    "Coffee",
    "Tea",
    "Whiskey",
    "Other",
  ];
  const drinkCategory = (drink: Drink) => {
    if (drink.type.toLowerCase().includes("tea")) return "Tea";
    if (drink.type.toLowerCase().includes("whiskey")) return "Whiskey";
    if (filterOptions.includes(drink.type)) return drink.type;
    return "Other";
  };
  const shown = exploreDrinks.filter((drink) =>
    filter === "All" ? true : drinkCategory(drink) === filter,
  );
  return (
    <Background>
      <View style={s.headerRow}>
        <Text style={s.headingText}>Saturated</Text>
        <View style={s.iconRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search drinks"
            onPress={() => onGo("search")}
            style={s.headerIcon}
          >
            <Search color={C.red} size={23} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open friends feed"
            onPress={() => onGo("feed")}
            style={s.headerIcon}
          >
            <Users color={C.red} size={23} />
          </Pressable>
        </View>
      </View>
      <ScrollView
        horizontal
        style={s.filterScroller}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.filters}
      >
        {filterOptions.map((f) => (
          <Pill
            key={f}
            selected={filter === f}
            color={C.green}
            onPress={() => setFilter(f)}
          >
            {f}
          </Pill>
        ))}
      </ScrollView>
      <FlatList
        data={shown}
        style={s.screenList}
        numColumns={3}
        keyExtractor={(x) => x.id}
        contentContainerStyle={s.grid}
        columnWrapperStyle={{ gap: 22 }}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${item.name}`}
            onPress={() => onOpen(item)}
            onLongPress={() => onToggle(item.id)}
            style={s.drinkCard}
          >
            <Image
              source={item.image}
              style={s.drinkImage}
              resizeMode="contain"
            />
            <View style={s.drinkLabel}>
              <Text numberOfLines={1} style={s.drinkName}>
                {item.name}
              </Text>
              <Text style={[s.tiny, { color: item.typeColor }]}>
                {item.type}
              </Text>
            </View>
          </Pressable>
        )}
      />
      <BottomNav active="explore" onGo={onGo} />
    </Background>
  );
}

function SearchScreen({
  saved,
  onBack,
  onOpen,
  onToggle,
}: {
  saved: string[];
  onBack: () => void;
  onOpen: (drink: Drink) => void;
  onToggle: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<"beverages" | "profiles">("beverages");
  const normalized = query.trim().toLowerCase();
  const beverageResults = drinks.filter(
    (drink) =>
      !!normalized &&
      (drink.name.toLowerCase().includes(normalized) ||
        drink.type.toLowerCase().includes(normalized) ||
        drink.tags.some((tag) => tag.toLowerCase().includes(normalized))),
  );
  const profileResults = searchableProfiles.filter(
    (profile) =>
      !!normalized &&
      (profile.name.toLowerCase().includes(normalized) ||
        profile.handle.toLowerCase().includes(normalized) ||
        profile.detail.toLowerCase().includes(normalized)),
  );

  return (
    <Background>
      <Heading back onBack={onBack}>
        Search
      </Heading>
      <View style={s.searchModeSwitch}>
        {(["beverages", "profiles"] as const).map((option) => (
          <Pressable
            key={option}
            accessibilityRole="button"
            accessibilityLabel={`Search ${option}`}
            onPress={() => setMode(option)}
            style={[
              s.searchModeButton,
              mode === option && s.searchModeButtonActive,
            ]}
          >
            <Text
              style={[
                s.searchModeText,
                mode === option && s.searchModeTextActive,
              ]}
            >
              {option[0].toUpperCase() + option.slice(1)}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={s.searchBar}>
        <Search size={21} color={C.teal} />
        <TextInput
          autoFocus
          value={query}
          onChangeText={setQuery}
          placeholder={
            mode === "beverages"
              ? "Search beverages, types or flavours"
              : "Search profiles or usernames"
          }
          placeholderTextColor="rgba(32,26,27,.45)"
          style={s.searchField}
        />
        {!!query && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Clear search"
            onPress={() => setQuery("")}
          >
            <X size={19} color={C.teal} />
          </Pressable>
        )}
      </View>
      {!!normalized && (
        <Text style={s.searchCount}>
          {mode === "beverages"
            ? `${beverageResults.length} ${
                beverageResults.length === 1 ? "beverage" : "beverages"
              }`
            : `${profileResults.length} ${
                profileResults.length === 1 ? "profile" : "profiles"
              }`}
        </Text>
      )}
      {mode === "beverages" ? (
        <FlatList
          data={beverageResults}
          style={s.screenList}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.searchResults}
          renderItem={({ item }) => (
            <Pressable onPress={() => onOpen(item)} style={s.searchResultCard}>
              <Image
                source={item.image}
                style={s.searchResultImage}
                resizeMode="contain"
              />
              <View style={s.searchResultCopy}>
                <Text style={s.searchResultName}>{item.name}</Text>
                <Text style={[s.body, { color: item.typeColor }]}>
                  {item.type} · {item.rating.toFixed(1)} ★
                </Text>
                <Text style={s.tiny}>{item.tags.join(" · ")}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  saved.includes(item.id)
                    ? "Remove from Drinklist"
                    : "Add to Drinklist"
                }
                onPress={(event) => {
                  event.stopPropagation();
                  onToggle(item.id);
                }}
                style={s.searchSaveButton}
              >
                <Heart
                  size={20}
                  color={C.red}
                  fill={saved.includes(item.id) ? C.red : "transparent"}
                />
              </Pressable>
            </Pressable>
          )}
          ListEmptyComponent={
            normalized ? (
              <View style={s.searchEmptyState}>
                <Text style={s.emptyTitle}>No beverages found</Text>
                <Text style={s.emptyPrompt}>Don’t see your drink?</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Request ${query}`}
                  style={s.requestDrinkButton}
                  onPress={() =>
                    Alert.alert(
                      "Drink requested",
                      `Thanks — we’ll review “${query.trim()}” for Saturated.`,
                    )
                  }
                >
                  <Text style={s.primaryText}>Request drink</Text>
                </Pressable>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={profileResults}
          style={s.screenList}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={s.searchResults}
          renderItem={({ item }) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Open ${item.name}'s profile`}
              onPress={() =>
                Alert.alert(item.name, `${item.handle}\n${item.detail}`)
              }
              style={s.profileSearchCard}
            >
              <Image source={item.avatar} style={s.profileSearchAvatar} />
              <View style={s.searchResultCopy}>
                <Text style={s.searchResultName}>{item.name}</Text>
                <Text style={[s.body, { color: C.teal }]}>{item.handle}</Text>
                <Text style={s.tiny}>{item.detail}</Text>
              </View>
            </Pressable>
          )}
          ListEmptyComponent={
            normalized ? (
              <View style={s.searchEmptyState}>
                <Text style={s.emptyTitle}>No profiles found</Text>
                <Text style={s.emptyPrompt}>Try a name or username.</Text>
              </View>
            ) : null
          }
        />
      )}
    </Background>
  );
}

function Drinklist({
  items,
  onRemove,
  onOpen,
  onReview,
  onGo,
}: {
  items: Drink[];
  onRemove: (id: string) => void;
  onOpen: (d: Drink) => void;
  onReview: (d: Drink) => void;
  onGo: (s: Screen) => void;
}) {
  const [sortByType, setSortByType] = useState(false);
  const visibleItems = sortByType
    ? [...items].sort((a, b) => a.type.localeCompare(b.type))
    : items;
  return (
    <Background>
      <View style={s.headerRow}>
        <Text style={s.headingText}>Drinklist</Text>
        <View style={s.iconRow}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Sort Drinklist by type"
            onPress={() => setSortByType((value) => !value)}
            style={[s.headerIcon, sortByType && s.headerIconActive]}
          >
            <Filter color={C.red} size={23} />
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search drinks"
            onPress={() => onGo("search")}
            style={s.headerIcon}
          >
            <Search color={C.red} size={23} />
          </Pressable>
        </View>
      </View>
      <Text style={[s.cardTitle, { marginHorizontal: 32, marginBottom: 14 }]}>
        {items.length} Drinks saved to try
      </Text>
      <ScrollView
        style={s.screenScroll}
        contentContainerStyle={{ paddingHorizontal: 32, paddingBottom: 130 }}
      >
        {visibleItems.map((d) => (
          <Pressable key={d.id} onPress={() => onOpen(d)} style={s.listCard}>
            <View style={s.listImageBox}>
              <Image
                source={d.image}
                style={s.listImage}
                resizeMode="contain"
              />
            </View>
            <View style={{ flex: 1, padding: 10 }}>
              <Text style={s.cardTitle}>{d.name}</Text>
              <View style={s.inline}>
                <Pill color={d.typeColor}>{d.type}</Pill>
                <Text style={s.cardTitle}>{d.rating} ★</Text>
              </View>
              <View style={s.inline}>
                {d.tags.map((t) => (
                  <Pill key={t} color="#960000">
                    {t}
                  </Pill>
                ))}
              </View>
            </View>
            <View style={{ gap: 10, padding: 12 }}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Review ${d.name}`}
                onPress={() => onReview(d)}
                style={s.smallButton}
              >
                <Edit3 size={16} color={C.teal} />
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Remove ${d.name} from Drinklist`}
                onPress={() => onRemove(d.id)}
                style={[
                  s.smallButton,
                  { backgroundColor: "rgba(255,164,164,.8)" },
                ]}
              >
                <X size={17} color={C.teal} />
              </Pressable>
            </View>
          </Pressable>
        ))}
        {!items.length && (
          <Text style={s.empty}>
            Your Drinklist is empty. Long-press a drink on Explore to save it.
          </Text>
        )}
      </ScrollView>
      <BottomNav active="drinklist" onGo={onGo} />
    </Background>
  );
}

function ReviewCard({
  review,
  onLike,
}: {
  review: Review;
  onLike: (id: string) => void;
}) {
  return (
    <View style={s.reviewCard}>
      <View style={s.inline}>
        <Image source={review.avatar} style={s.avatar} />
        <View style={{ flex: 1 }}>
          <Text style={s.body}>{review.user}</Text>
          <Rating value={review.rating} />
        </View>
        <Text style={s.tiny}>{review.date}</Text>
      </View>
      <Text style={[s.reviewText, { marginVertical: 9 }]}>{review.text}</Text>
      <View style={[s.inline, { justifyContent: "space-between" }]}>
        <View style={s.inline}>
          {review.tags.map((t) => (
            <Pill key={t} color="#960000">
              {t}
            </Pill>
          ))}
        </View>
        <View style={s.inline}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Open ${review.comments} comments`}
            onPress={() =>
              Alert.alert(
                "Comments",
                review.comments
                  ? `${review.comments} people commented on this review.`
                  : "Be the first to comment on this review.",
              )
            }
          >
            <MessageCircle size={13} />
          </Pressable>
          <Text style={s.tiny}>{review.comments}</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Like ${review.user}'s review`}
            onPress={() => onLike(review.id)}
          >
            <Heart size={13} />
          </Pressable>
          <Text style={s.tiny}>{review.likes}</Text>
        </View>
      </View>
    </View>
  );
}

function DrinkProfile({
  drink,
  reviews,
  saved,
  onBack,
  onReview,
  onToggle,
  onLike,
}: {
  drink: Drink;
  reviews: Review[];
  saved: boolean;
  onBack: () => void;
  onReview: () => void;
  onToggle: () => void;
  onLike: (id: string) => void;
}) {
  const mine = reviews.filter((r) => r.drinkId === drink.id);
  const avg = mine.length
    ? mine.reduce((a, b) => a + b.rating, 0) / mine.length
    : drink.rating;
  const popularTags = Object.entries(
    mine
      .flatMap((review) => review.tags)
      .reduce<Record<string, number>>(
        (counts, tag) => ({ ...counts, [tag]: (counts[tag] || 0) + 1 }),
        {},
      ),
  )
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([tag]) => tag);
  const commonUserTags = popularTags.length ? popularTags : drink.tags;
  return (
    <Background>
      <ScrollView
        style={s.screenScroll}
        contentContainerStyle={{ paddingBottom: 35 }}
      >
        <Heading back onBack={onBack}>
          Drink Profile
        </Heading>
        <View style={s.hero}>
          <Image
            source={drink.image}
            style={s.heroImage}
            resizeMode="contain"
          />
          <View style={s.heroPill}>
            <Pill color={drink.typeColor}>{drink.type}</Pill>
          </View>
        </View>
        <View style={s.detailCard}>
          <Text style={s.detailTitle}>{drink.name}</Text>
          <Text style={s.inlineText}>
            {"★".repeat(Math.round(avg))} {avg.toFixed(1)} — {mine.length || 56}{" "}
            Reviews
          </Text>
          <Text style={[s.body, { marginVertical: 14 }]}>
            {drink.description}
          </Text>
          <View style={[s.inline, { justifyContent: "space-between" }]}>
            <View>
              <Text style={s.body}>
                Origin :{" "}
                <Text style={{ color: C.teal }}>
                  {drink.origin || "International"}
                </Text>
              </Text>
              <Text style={s.body}>
                Brand :{" "}
                <Text style={{ color: C.teal }}>
                  {drink.brand || drink.name}
                </Text>
              </Text>
            </View>
            <View>
              <Text style={s.body}>Official tags</Text>
              <View style={s.inline}>
                {drink.tags.map((t) => (
                  <Pill key={t} color="#960000">
                    {t}
                  </Pill>
                ))}
              </View>
            </View>
          </View>
        </View>
        <View
          style={[
            s.inline,
            { marginHorizontal: 32, marginTop: 22, marginBottom: 22 },
          ]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Review ${drink.name}`}
            onPress={onReview}
            style={[s.primary, { flex: 1 }]}
          >
            <Text style={s.primaryText}>✎ Write a Review</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              saved ? "Remove from Drinklist" : "Add to Drinklist"
            }
            onPress={onToggle}
            style={[s.secondary, { flex: 1 }]}
          >
            <Text style={s.secondaryText}>
              {saved ? "✓ Saved" : "+ Add to List"}
            </Text>
          </Pressable>
        </View>
        <View style={s.commonTagsSection}>
          <Text style={s.cardTitle}>Common user flavour tags</Text>
          <Text style={s.commonTagsText}>{commonUserTags.join("  ·  ")}</Text>
        </View>
        {mine.map((r) => (
          <ReviewCard key={r.id} review={r} onLike={onLike} />
        ))}
      </ScrollView>
    </Background>
  );
}

function ReviewScreen({
  drink,
  onBack,
  onSubmit,
}: {
  drink: Drink;
  onBack: () => void;
  onSubmit: (r: number, t: string, tags: string[]) => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState("");
  const [addingCustom, setAddingCustom] = useState(false);
  const [availableNotes, setAvailableNotes] = useState([
    "Citrusy",
    "Fresh",
    "Tangy",
    "Sweet",
    "Strong",
    "Floral",
    "Nutty",
    "Bitter",
    "Creamy",
    "Refreshing",
    "Tarty",
  ]);
  return (
    <Background>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView style={s.screenScroll} keyboardShouldPersistTaps="handled">
          <Heading back onBack={onBack}>
            Review
          </Heading>
          <View style={[s.reviewDrink, glass]}>
            <Image
              source={drink.image}
              style={s.reviewDrinkImage}
              resizeMode="contain"
            />
            <View>
              <Text style={s.detailTitle}>{drink.name}</Text>
              <Pill color={drink.typeColor}>{drink.type}</Pill>
            </View>
          </View>
          <View style={[s.ratingCard, glass]}>
            <Text style={s.cardTitle}>Tap to Rate</Text>
            <View style={s.ratingRow}>
              <HalfStarRatingInput value={rating} onChange={setRating} />
              <Text style={s.ratingNumber}>{rating.toFixed(1)}</Text>
            </View>
          </View>
          <View style={[s.formCard, glass]}>
            <Text style={s.cardTitle}>Your Review</Text>
            <TextInput
              value={text}
              onChangeText={setText}
              multiline
              textAlignVertical="top"
              placeholder="What did you think of the drink?..."
              style={s.reviewInput}
            />
          </View>
          <View style={[s.notesCard, glass]}>
            <Text style={s.cardTitle}>Flavour notes</Text>
            <View style={s.notes}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Add a custom flavour note"
                style={s.addNoteChip}
                onPress={() => setAddingCustom((value) => !value)}
              >
                <Text style={[s.tiny, { color: "#fff" }]}>Add +</Text>
              </Pressable>
              {availableNotes.map((n) => (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Toggle ${n} flavour note`}
                  key={n}
                  style={[s.noteChip, tags.includes(n) && s.noteChipSelected]}
                  onPress={() =>
                    setTags((x) =>
                      x.includes(n) ? x.filter((y) => y !== n) : [...x, n],
                    )
                  }
                >
                  <Text
                    style={[
                      s.tiny,
                      { color: tags.includes(n) ? "#960000" : "#5f6f66" },
                    ]}
                  >
                    {n}
                  </Text>
                </Pressable>
              ))}
            </View>
            {addingCustom && (
              <View style={s.customNoteRow}>
                <TextInput
                  autoFocus
                  value={customNote}
                  onChangeText={setCustomNote}
                  placeholder="Custom flavour note"
                  placeholderTextColor="rgba(32,26,27,.45)"
                  style={s.customNoteInput}
                />
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save custom flavour note"
                  style={s.addNoteButton}
                  onPress={() => {
                    const note = customNote.trim();
                    if (!note) return;
                    const existing = availableNotes.find(
                      (item) => item.toLowerCase() === note.toLowerCase(),
                    );
                    const savedNote = existing || note;
                    if (!existing)
                      setAvailableNotes((current) => [...current, savedNote]);
                    if (!tags.includes(savedNote))
                      setTags((current) => [...current, savedNote]);
                    setCustomNote("");
                    setAddingCustom(false);
                  }}
                >
                  <Text style={[s.tiny, { color: "#fff" }]}>Save</Text>
                </Pressable>
              </View>
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Submit review"
            style={[s.primary, { margin: 32, height: 46 }]}
            onPress={() => {
              if (!rating)
                return Alert.alert(
                  "Choose a rating",
                  "Select at least half a star before submitting.",
                );
              if (!text.trim())
                return Alert.alert(
                  "Write a review",
                  "Tell us what you thought before submitting.",
                );
              onSubmit(rating, text.trim(), tags);
            }}
          >
            <Text style={s.primaryText}>Submit</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </Background>
  );
}

const badgeNames = [
  "First Sip",
  "Wine much",
  "Caffeine in my Blood",
  "Around the World",
  "Pint Master",
  "Cocktailio",
  "Always on the rocks",
  "Coke Zero Gang",
  "Spritz or nothing",
];
const bottleCapPoints = Array.from({ length: 48 }, (_, index) => {
  const angle = (index * Math.PI * 2) / 48 - Math.PI / 2;
  const radius = index % 2 === 0 ? 43 : 36;
  return `${44 + Math.cos(angle) * radius},${44 + Math.sin(angle) * radius}`;
}).join(" ");

function ProgressRing({ value }: { value: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  return (
    <View style={s.progressCircle}>
      <Svg width={44} height={44}>
        <Circle
          cx={22}
          cy={22}
          r={radius}
          fill="transparent"
          stroke="rgba(43,73,89,.18)"
          strokeWidth={4}
        />
        <Circle
          cx={22}
          cy={22}
          r={radius}
          fill="transparent"
          stroke={C.green}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - value)}
          transform="rotate(-90 22 22)"
        />
      </Svg>
      <Text style={s.progressText}>{Math.round(value * 100)}%</Text>
    </View>
  );
}

function BadgeCap({ earned = false }: { earned?: boolean }) {
  return (
    <Svg width={88} height={88}>
      <Defs>
        <SvgRadialGradient id="badgeCap" cx="36%" cy="28%" rx="75%" ry="75%">
          <Stop offset="0" stopColor={earned ? "#fff1a8" : "#c9d8ce"} />
          <Stop offset=".65" stopColor={earned ? "#e6aa36" : "#9eada5"} />
          <Stop offset="1" stopColor={earned ? C.red : "#74837c"} />
        </SvgRadialGradient>
      </Defs>
      <Polygon points={bottleCapPoints} fill="url(#badgeCap)" />
      <Circle cx={44} cy={44} r={28} fill="rgba(255,255,255,.08)" />
    </Svg>
  );
}

function ReceiptZigzag() {
  const points = [
    "0,12",
    ...Array.from({ length: 48 }, (_, index) => {
      const x = index * (374 / 47);
      return `${x},${index % 2 === 0 ? 5 : 0}`;
    }),
    "374,12",
  ].join(" ");
  return (
    <Svg
      width="100%"
      height={12}
      viewBox="0 0 374 12"
      preserveAspectRatio="none"
    >
      <Polygon points={points} fill={C.red} />
    </Svg>
  );
}

function Profile({
  name,
  reviews,
  badgeTab,
  setBadgeTab,
  onGo,
  onReview,
  onEdit,
}: {
  name: string;
  reviews: Review[];
  badgeTab: boolean;
  setBadgeTab: (b: boolean) => void;
  onGo: (s: Screen) => void;
  onReview: (d: Drink) => void;
  onEdit: () => void;
}) {
  const my = reviews.filter((r) => r.user === name || r.user === "Mark Kelly");
  const earned = Math.min(9, Math.max(2, my.length + 1));
  const earnedIndices = new Set([0, 4, 1, 2, 3, 5, 6, 7, 8].slice(0, earned));
  const avg = my.length ? my.reduce((a, b) => a + b.rating, 0) / my.length : 0;
  const shareReceipt = async () => {
    const receiptLines = my.map((review, index) => {
      const drink = drinks.find((item) => item.id === review.drinkId);
      return `${index + 1}. ${drink?.name || "Drink"} — ${review.rating.toFixed(
        1,
      )}/5\n“${review.text}”`;
    });
    try {
      await Share.share({
        title: "My Saturated receipt",
        message: `My Saturated receipt\n\n${receiptLines.join("\n\n")}`,
      });
    } catch {
      Alert.alert(
        "Share receipt",
        "Your receipt is ready to share to Instagram or another social app.",
      );
    }
  };
  return (
    <Background>
      <View style={s.headerRow}>
        <Text style={s.headingText}>Profile</Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Profile settings"
          onPress={() =>
            Alert.alert(
              "Profile settings",
              "Your account, Drinklist and reviews are saved on this device.",
            )
          }
          style={s.headerIcon}
        >
          <Settings color={C.red} />
        </Pressable>
      </View>
      <View style={[s.profileCard, glass]}>
        <Image
          source={require("./assets/people/mark.png")}
          style={s.profileAvatar}
        />
        <View style={{ flex: 1 }}>
          <Text style={s.cardTitle}>{name || "Mark Kelly"}</Text>
          <Text style={s.tiny}>Date Joined: 10 Jun 2026</Text>
        </View>
        <Pill color={C.green} onPress={onEdit}>
          Edit
        </Pill>
      </View>
      <View style={[s.inline, { marginHorizontal: 32 }]}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show reviews"
          onPress={() => setBadgeTab(false)}
          style={[s.tab, !badgeTab && s.tabActive]}
        >
          <Text style={[s.primaryText, badgeTab && { color: "#666" }]}>
            Reviews
          </Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Show badges"
          onPress={() => setBadgeTab(true)}
          style={[s.tab, badgeTab && s.tabActive]}
        >
          <Text style={[s.primaryText, !badgeTab && { color: "#666" }]}>
            Badges
          </Text>
        </Pressable>
      </View>
      {badgeTab ? (
        <ScrollView
          style={s.screenScroll}
          contentContainerStyle={{ paddingBottom: 125 }}
        >
          <View style={[s.progressCard, glass]}>
            <ProgressRing value={earned / 9} />
            <View>
              <Text style={s.cardTitle}>{earned} of 9 badges unlocked</Text>
              <Text style={s.reviewText}>Try more drinks to earn badges</Text>
            </View>
          </View>
          <View style={s.badges}>
            {badgeNames.map((badgeName, index) => {
              const earnedBadge = earnedIndices.has(index);
              const exactArtwork =
                index === 0
                  ? require("./assets/badges/first-sip.png")
                  : index === 4
                    ? require("./assets/badges/pint-master.png")
                    : null;
              return (
                <View
                  key={badgeName}
                  style={[s.badgeItem, !earnedBadge && s.badgeLocked]}
                >
                  {earnedBadge && exactArtwork ? (
                    <Image
                      source={exactArtwork}
                      accessibilityLabel={badgeName}
                      style={
                        index === 4 ? s.badgeCompositeTall : s.badgeComposite
                      }
                      resizeMode="contain"
                    />
                  ) : (
                    <>
                      <BadgeCap earned={earnedBadge} />
                      <Text style={[s.tiny, s.badgeLabel]}>{badgeName}</Text>
                    </>
                  )}
                </View>
              );
            })}
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          style={s.screenScroll}
          contentContainerStyle={{ paddingBottom: 125 }}
        >
          <View style={s.stats}>
            <View style={[s.stat, glass]}>
              <Text style={s.statNumber}>{my.length} 🍷</Text>
              <Text style={s.cardTitle}>Drinks Tried</Text>
            </View>
            <View style={[s.stat, glass]}>
              <Text style={s.statNumber}>{avg.toFixed(1)} ★</Text>
              <Text style={s.cardTitle}>Avg. Rating</Text>
            </View>
          </View>
          <Text
            style={[s.cardTitle, { marginHorizontal: 32, marginVertical: 12 }]}
          >
            Your Receipt
          </Text>
          <View style={s.receiptWrap}>
            <ReceiptZigzag />
            <View style={s.receipt}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share receipt to Instagram or social apps"
                onPress={shareReceipt}
                style={s.receiptShareButton}
              >
                <Share2 size={14} color={C.red} />
                <Text style={s.receiptShareText}>Share</Text>
              </Pressable>
              <Text style={s.receiptLogo}>Saturated</Text>
              <View style={s.dash} />
              <View style={[s.inline, { justifyContent: "space-between" }]}>
                <Text style={s.tiny}>QTY ITEM</Text>
                <Text style={s.tiny}>RATING</Text>
              </View>
              {my.map((r, i) => {
                const d = drinks.find((x) => x.id === r.drinkId)!;
                return (
                  <Pressable
                    key={r.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Edit review for ${d?.name}`}
                    onPress={() => onReview(d)}
                    style={{ marginTop: 16 }}
                  >
                    <View
                      style={[s.inline, { justifyContent: "space-between" }]}
                    >
                      <Text style={s.body}>
                        {i + 1} {d?.name} ✎
                      </Text>
                      <Text style={{ color: "#e3a000" }}>
                        {"★".repeat(Math.round(r.rating))}
                      </Text>
                    </View>
                    <Text style={s.tiny}> {r.date}</Text>
                    <Text
                      style={[s.reviewText, { marginLeft: 30, marginTop: 5 }]}
                    >
                      “{r.text}”
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>
      )}
      <BottomNav active="profile" onGo={onGo} />
    </Background>
  );
}

const feedFriendCards = [
  {
    drinkId: "heineken",
    source: require("./assets/feed/friend-heineken.png"),
    count: "8",
  },
  {
    drinkId: "rose",
    source: require("./assets/feed/friend-rose.png"),
    count: "2",
  },
  {
    drinkId: "espresso",
    source: require("./assets/feed/friend-espresso.png"),
    count: "10+",
  },
  {
    drinkId: "pilsner",
    source: require("./assets/feed/friend-pilsner.png"),
    count: "6",
  },
  {
    drinkId: "petrus",
    source: require("./assets/feed/friend-petrus.png"),
    count: "5",
  },
];

const feedActivity = [
  {
    group: "Today",
    name: "James kent",
    message: "rated Pilsner Urquell 4.5/5 🍺",
    action: "Read the review →",
    time: "8h ago",
    avatar: require("./assets/people/james.png"),
    drinkId: "pilsner",
  },
  {
    group: "Yesterday",
    name: "Liddy Powell",
    message: "unlocked First Sip! 🥤",
    time: "1 day ago",
    avatar: require("./assets/people/liddy.png"),
    drinkId: "sprite",
  },
  {
    name: "Jaques Dane",
    message: "reviewed Heineken 🍺",
    action: "Read the review →",
    time: "1 day ago",
    avatar: require("./assets/people/jaques.png"),
    drinkId: "heineken",
  },
  {
    group: "Earlier this week",
    name: "Liddy Powell",
    message: "followed you",
    time: "2 days ago",
    avatar: require("./assets/people/liddy.png"),
    drinkId: "sprite",
  },
  {
    name: "Aperol Spritz",
    message: "is trending this week! 🔥",
    action: "127 Reviews →",
    time: "2 days ago",
    avatar: require("./assets/drinks/aperol.png"),
    drinkId: "aperol",
  },
  {
    name: "Sarah James",
    message: "added White Choc Matcha Latte to her Drinklist +",
    time: "2 days ago",
    avatar: require("./assets/people/sarah.png"),
    drinkId: "matcha",
  },
  {
    name: "Sarah James",
    message: "commented on your review",
    action: "“It’s definitely some quality beer”",
    quote: true,
    time: "4 days ago",
    avatar: require("./assets/people/sarah.png"),
    drinkId: "birra",
  },
];

function Feed({
  onBack,
  onOpen,
}: {
  onBack: () => void;
  onOpen: (drink: Drink) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visibleFriends = showAll
    ? [
        ...feedFriendCards,
        ...exploreDrinks.slice(5, 10).map((drink) => ({
          drinkId: drink.id,
          source: drink.image,
          count: "3",
        })),
      ]
    : feedFriendCards;
  const drinkById = (id: string) =>
    drinks.find((drink) => drink.id === id) || drinks[0];

  return (
    <Background>
      <ScrollView style={s.screenScroll} contentContainerStyle={s.feedContent}>
        <Heading back onBack={onBack}>
          Feed
        </Heading>
        <View style={s.feedSectionHeader}>
          <Text style={s.cardTitle}>Your friends are drinking..</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              showAll ? "Show fewer friend drinks" : "View more friend drinks"
            }
            onPress={() => setShowAll((value) => !value)}
          >
            <Text style={[s.cardTitle, { color: C.red }]}>
              {showAll ? "Show Less" : "View More →"}
            </Text>
          </Pressable>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.friendStrip}
        >
          {visibleFriends.map((friend, index) => (
            <Pressable
              key={`${friend.drinkId}-${index}`}
              accessibilityRole="button"
              accessibilityLabel={`Open ${drinkById(friend.drinkId).name}`}
              onPress={() => onOpen(drinkById(friend.drinkId))}
              style={s.friendDrink}
            >
              <Image
                source={friend.source}
                style={index < 5 ? s.friendComposite : s.friendImage}
                resizeMode="contain"
              />
              {index >= 5 && (
                <Text numberOfLines={1} style={s.friendName}>
                  {drinkById(friend.drinkId).name}
                </Text>
              )}
              <Text style={s.friendCount}>{friend.count} ◉◉◉</Text>
            </Pressable>
          ))}
        </ScrollView>
        <Text style={s.activityTitle}>Friends Activity</Text>
        {feedActivity.map((activity, index) => (
          <View key={`${activity.name}-${index}`}>
            {!!activity.group && (
              <Text style={s.activityGroup}>{activity.group}</Text>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${activity.name} ${activity.message}`}
              onPress={() => onOpen(drinkById(activity.drinkId))}
              style={[
                s.activity,
                glass,
                activity.action ? s.activityTall : s.activityShort,
              ]}
            >
              <Image
                source={activity.avatar}
                style={s.activityAvatar}
                resizeMode="cover"
              />
              <View style={s.activityCopy}>
                <Text style={s.body}>
                  <Text style={{ fontFamily: F.bold }}>{activity.name} </Text>
                  {activity.message}
                </Text>
                {!!activity.action && (
                  <Text
                    style={[
                      s.activityAction,
                      activity.quote && s.activityQuote,
                    ]}
                  >
                    {activity.action}
                  </Text>
                )}
              </View>
              <Text style={s.activityTime}>{activity.time}</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </Background>
  );
}

export default function App() {
  const [dm] = useDMSans({
    DMSans: DMSans_400Regular,
    DMSansMedium: DMSans_500Medium,
    DMSansBold: DMSans_700Bold,
  });
  const [bold] = useBoldonse({ Boldonse: Boldonse_400Regular });
  const [screen, setScreen] = useState<Screen>("splash");
  const [onboard, setOnboard] = useState(false);
  const [name, setName] = useState("Mark Kelly");
  const [saved, setSaved] = useState(["aperol", "sprite", "hophouse"]);
  const [reviews, setReviews] = useState(initialReviews);
  const [selected, setSelected] = useState(drinks[0]);
  const [badgeTab, setBadgeTab] = useState(false);
  const [searchReturn, setSearchReturn] = useState<Screen>("explore");
  const [drinkReturn, setDrinkReturn] = useState<Screen>("explore");
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        const x = raw ? JSON.parse(raw) : null;
        if (x?.onboarded) {
          setOnboarded(true);
          setName(x.name || "Mark Kelly");
          setSaved(x.saved || []);
          setReviews(x.reviews || initialReviews);
          setScreen("explore");
        } else {
          setScreen("splash");
          setOnboard(true);
        }
      })
      .catch(() => {
        setScreen("splash");
        setOnboard(true);
      })
      .finally(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready)
      AsyncStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ onboarded, name, saved, reviews }),
      );
  }, [ready, onboarded, name, saved, reviews]);
  const go = (nextScreen: Screen) => {
    if (nextScreen === "search") setSearchReturn(screen);
    setScreen(nextScreen);
  };
  const open = (d: Drink) => {
    setDrinkReturn(screen);
    setSelected(d);
    setScreen("drink");
  };
  const review = (d: Drink) => {
    if (screen !== "drink") setDrinkReturn(screen);
    setSelected(d);
    setScreen("review");
  };
  const toggle = (id: string) =>
    setSaved((x) => (x.includes(id) ? x.filter((y) => y !== id) : [...x, id]));
  const like = (id: string) =>
    setReviews((x) =>
      x.map((r) => (r.id === id ? { ...r, likes: r.likes + 1 } : r)),
    );
  if (!dm || !bold || !ready)
    return (
      <View style={s.loader}>
        <ActivityIndicator color={C.red} />
      </View>
    );
  let body: React.ReactNode;
  if (screen === "splash") body = <Splash />;
  else if (screen === "explore")
    body = <Explore onOpen={open} onToggle={toggle} onGo={go} />;
  else if (screen === "search")
    body = (
      <SearchScreen
        saved={saved}
        onBack={() => go(searchReturn)}
        onOpen={open}
        onToggle={toggle}
      />
    );
  else if (screen === "drinklist")
    body = (
      <Drinklist
        items={drinks.filter((d) => saved.includes(d.id))}
        onRemove={toggle}
        onOpen={open}
        onReview={review}
        onGo={go}
      />
    );
  else if (screen === "drink")
    body = (
      <DrinkProfile
        drink={selected}
        reviews={reviews}
        saved={saved.includes(selected.id)}
        onBack={() => go(drinkReturn)}
        onReview={() => review(selected)}
        onToggle={() => toggle(selected.id)}
        onLike={like}
      />
    );
  else if (screen === "review")
    body = (
      <ReviewScreen
        drink={selected}
        onBack={() => go("drink")}
        onSubmit={(rating, text, tags) => {
          setReviews((x) => [
            {
              id: Date.now().toString(),
              drinkId: selected.id,
              user: name,
              avatar: require("./assets/people/mark.png"),
              rating,
              text,
              tags,
              date: new Date().toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              }),
              likes: 0,
              comments: 0,
            },
            ...x,
          ]);
          setSaved((x) => x.filter((id) => id !== selected.id));
          go("drink");
        }}
      />
    );
  else if (screen === "profile")
    body = (
      <Profile
        name={name}
        reviews={reviews}
        badgeTab={badgeTab}
        setBadgeTab={setBadgeTab}
        onGo={go}
        onReview={review}
        onEdit={() => {
          setScreen("splash");
          setOnboard(true);
        }}
      />
    );
  else body = <Feed onBack={() => go("explore")} onOpen={open} />;
  return (
    <>
      {body}
      <Onboarding
        visible={onboard}
        onDone={(n) => {
          setName(n);
          setOnboarded(true);
          setOnboard(false);
          setScreen("explore");
        }}
      />
    </>
  );
}

const s = StyleSheet.create({
  safe: {
    flex: 1,
    height: Platform.OS === "web" ? FIGMA_FRAME_HEIGHT : "100%",
    maxHeight: FIGMA_FRAME_HEIGHT,
    minHeight: 0,
    width: Platform.OS === "web" ? FIGMA_FRAME_WIDTH : "100%",
    maxWidth: FIGMA_FRAME_WIDTH,
    marginHorizontal: "auto",
    backgroundColor: C.cream,
    overflow: "hidden",
  },
  bg: { ...StyleSheet.absoluteFill, backgroundColor: "rgba(234,248,209,.36)" },
  deviceStatusBar: {
    height: 22,
    backgroundColor: "#292626",
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 20,
  },
  deviceStatusText: {
    color: "#fff",
    fontFamily: F.bold,
    fontSize: 12,
    lineHeight: 14,
  },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  screenList: { flex: 1, minHeight: 0 },
  screenScroll: { flex: 1, minHeight: 0 },
  heading: {
    height: 90,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    paddingHorizontal: 30,
  },
  headingText: { fontFamily: F.display, fontSize: 32, color: C.red },
  headerRow: {
    height: 78,
    paddingHorizontal: 27,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  iconRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  headerIcon: {
    width: 25,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  headerIconActive: {
    borderRadius: 10,
    backgroundColor: "rgba(204,36,44,.1)",
  },
  filterScroller: {
    height: 45,
    minHeight: 45,
    maxHeight: 45,
    flexGrow: 0,
    flexShrink: 0,
  },
  filters: { height: 45, paddingHorizontal: 27, gap: 8, alignItems: "center" },
  pill: {
    borderWidth: 1,
    borderColor: "rgba(0,0,0,.4)",
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  tiny: { fontFamily: F.medium, fontSize: 10, color: C.ink },
  body: { fontFamily: F.medium, fontSize: 12, lineHeight: 15, color: C.ink },
  reviewText: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 15,
    color: C.ink,
  },
  cardTitle: { fontFamily: F.bold, fontSize: 14, color: C.ink },
  inline: { flexDirection: "row", alignItems: "center", gap: 8 },
  inlineText: { fontFamily: F.medium, fontSize: 12, color: C.ink },
  primary: {
    backgroundColor: C.red,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    padding: 13,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 3 },
  },
  primaryText: { fontFamily: F.bold, fontSize: 14, color: "#fff" },
  secondary: {
    ...glass,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    padding: 13,
  },
  secondaryText: { fontFamily: F.bold, fontSize: 14, color: C.teal },
  searchInput: {
    height: 38,
    marginHorizontal: 28,
    marginVertical: 4,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,.7)",
    paddingHorizontal: 16,
    fontFamily: F.regular,
  },
  searchBar: {
    ...glass,
    height: 52,
    marginHorizontal: 32,
    borderRadius: 23,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,.74)",
  },
  searchField: {
    flex: 1,
    height: 48,
    fontFamily: F.medium,
    fontSize: 14,
    color: C.ink,
    outlineStyle: "none",
  } as any,
  searchModeSwitch: {
    height: 38,
    marginHorizontal: 32,
    marginBottom: 12,
    padding: 3,
    borderRadius: 19,
    backgroundColor: "rgba(43,73,89,.1)",
    flexDirection: "row",
  },
  searchModeButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  searchModeButtonActive: {
    backgroundColor: C.teal,
    shadowColor: "#000",
    shadowOpacity: 0.16,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 2 },
  },
  searchModeText: {
    fontFamily: F.bold,
    fontSize: 12,
    color: C.teal,
  },
  searchModeTextActive: { color: "#fff" },
  searchCount: {
    marginHorizontal: 33,
    marginTop: 16,
    marginBottom: 8,
    fontFamily: F.bold,
    fontSize: 12,
    color: C.ink,
  },
  searchResults: { paddingHorizontal: 32, paddingBottom: 30, gap: 12 },
  searchResultCard: {
    ...glass,
    minHeight: 96,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
  },
  searchResultImage: { width: 62, height: 76 },
  searchResultCopy: { flex: 1, gap: 4, paddingHorizontal: 12 },
  searchResultName: { fontFamily: F.bold, fontSize: 16, color: C.ink },
  searchSaveButton: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  searchEmptyState: {
    alignItems: "center",
    marginTop: 62,
    gap: 10,
  },
  emptyTitle: { fontFamily: F.bold, fontSize: 18, color: C.ink },
  emptyPrompt: { fontFamily: F.medium, fontSize: 13, color: C.teal },
  requestDrinkButton: {
    minWidth: 148,
    height: 42,
    borderRadius: 21,
    marginTop: 4,
    backgroundColor: C.red,
    alignItems: "center",
    justifyContent: "center",
  },
  profileSearchCard: {
    ...glass,
    minHeight: 88,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  profileSearchAvatar: { width: 58, height: 58, borderRadius: 29 },
  grid: { paddingHorizontal: 32, paddingTop: 20, paddingBottom: 130, gap: 22 },
  drinkCard: {
    ...glass,
    width: 110,
    height: 187,
    borderRadius: 16,
    backgroundColor: "rgba(250,255,242,.9)",
    overflow: "hidden",
  },
  drinkImage: { width: "100%", height: 154 },
  drinkLabel: {
    height: 33,
    backgroundColor: "rgba(255,255,255,.86)",
    alignItems: "center",
    paddingTop: 3,
  },
  drinkName: { fontFamily: F.bold, fontSize: 11, maxWidth: 100 },
  savedMark: {
    display: "none",
    position: "absolute",
    right: 6,
    top: 5,
    color: C.red,
    fontSize: 16,
  },
  saveButton: {
    position: "absolute",
    right: 6,
    top: 6,
    width: 27,
    height: 27,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,.76)",
    alignItems: "center",
    justifyContent: "center",
  },
  nav: {
    ...glass,
    position: "absolute",
    left: 33,
    right: 33,
    bottom: 34,
    height: 80,
    borderRadius: 24,
    overflow: "hidden",
    flexDirection: "row",
  },
  navTint: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(4,178,100,.18)",
  },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
  navActive: { backgroundColor: "rgba(0,0,0,.3)" },
  navText: { fontFamily: F.display, fontSize: 16, color: C.teal },
  listCard: {
    ...glass,
    height: 110,
    borderRadius: 23,
    marginBottom: 12,
    flexDirection: "row",
    overflow: "hidden",
  },
  listImageBox: {
    width: 77,
    backgroundColor: "rgba(244,250,228,.45)",
    alignItems: "center",
  },
  listImage: { width: 62, height: 86, marginTop: 8 },
  smallButton: {
    ...glass,
    width: 33,
    height: 33,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  empty: {
    fontFamily: F.medium,
    textAlign: "center",
    marginTop: 70,
    color: "#666",
  },
  avatar: { width: 34, height: 34, borderRadius: 17 },
  hero: {
    ...glass,
    height: 275,
    marginHorizontal: 35,
    borderRadius: 23,
    backgroundColor: "rgba(250,255,242,.75)",
    position: "relative",
  },
  heroImage: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 15,
    width: "100%",
    height: 240,
  },
  heroPill: { position: "absolute", left: 14, top: 14, zIndex: 2 },
  detailCard: {
    ...glass,
    marginHorizontal: 32,
    marginTop: 22,
    marginBottom: 5,
    borderRadius: 23,
    padding: 21,
  },
  detailTitle: { fontFamily: F.bold, fontSize: 28, color: C.ink },
  reviewCard: {
    ...glass,
    marginHorizontal: 32,
    marginBottom: 14,
    borderRadius: 16,
    padding: 20,
    backgroundColor: C.cream,
  },
  reviewDrink: {
    height: 99,
    marginHorizontal: 33,
    marginTop: 10,
    borderRadius: 23,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  reviewDrinkImage: { width: 55, height: 76, marginRight: 8 },
  ratingCard: {
    height: 100,
    margin: 22,
    marginHorizontal: 33,
    borderRadius: 23,
    padding: 20,
    gap: 10,
  },
  ratingRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  starPicker: { flexDirection: "row", alignItems: "center", gap: 2 },
  halfStarFill: {
    position: "absolute",
    left: 0,
    top: 0,
    height: 35,
    overflow: "hidden",
  },
  filledStar: { position: "absolute", left: 0, top: 0 },
  halfStarHitArea: {
    ...StyleSheet.absoluteFill,
    flexDirection: "row",
  },
  halfStarButton: { flex: 1 },
  ratingNumber: { fontFamily: F.bold, fontSize: 36, color: C.ink },
  formCard: {
    height: 264,
    marginHorizontal: 33,
    borderRadius: 23,
    padding: 12,
  },
  reviewInput: {
    height: 209,
    marginTop: 8,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,.8)",
    padding: 12,
    fontFamily: F.regular,
    fontSize: 12,
  },
  notesCard: {
    margin: 22,
    marginHorizontal: 33,
    borderRadius: 23,
    padding: 20,
  },
  customNoteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  customNoteInput: {
    flex: 1,
    height: 30,
    borderRadius: 15,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255,255,255,.52)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,.25)",
    fontFamily: F.medium,
    fontSize: 10,
  },
  addNoteButton: {
    height: 28,
    minWidth: 62,
    borderRadius: 14,
    paddingHorizontal: 13,
    backgroundColor: C.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  notes: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  noteChip: {
    height: 24,
    minWidth: 65,
    paddingHorizontal: 13,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(43,73,89,.55)",
    alignItems: "center",
    justifyContent: "center",
  },
  noteChipSelected: {
    backgroundColor: "rgba(255,119,125,.3)",
    borderColor: "rgba(150,0,0,.54)",
  },
  addNoteChip: {
    height: 24,
    minWidth: 65,
    paddingHorizontal: 13,
    borderRadius: 15,
    backgroundColor: C.teal,
    alignItems: "center",
    justifyContent: "center",
  },
  commonTagsSection: {
    marginHorizontal: 32,
    marginBottom: 14,
    paddingHorizontal: 2,
    gap: 6,
  },
  commonTagsText: {
    fontFamily: F.medium,
    fontSize: 12,
    lineHeight: 18,
    color: "#960000",
  },
  profileCard: {
    height: 77,
    marginHorizontal: 33,
    marginTop: 11,
    borderRadius: 23,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileAvatar: { width: 55, height: 55, borderRadius: 28 },
  tab: {
    ...glass,
    height: 34,
    flex: 1,
    marginTop: 10,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: C.red },
  progressCard: {
    height: 66,
    margin: 12,
    marginHorizontal: 33,
    borderRadius: 20,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressCircle: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  progressText: {
    position: "absolute",
    fontFamily: F.medium,
    fontSize: 10,
    color: C.ink,
  },
  badges: {
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 0,
  },
  badgeItem: {
    width: "31%",
    height: 120,
    alignItems: "center",
  },
  badgeLocked: { opacity: 0.42 },
  badgeLabel: {
    width: 105,
    textAlign: "center",
    marginTop: 2,
  },
  badgeComposite: { width: 88, height: 105 },
  badgeCompositeTall: { width: 88, height: 121 },
  stats: { flexDirection: "row", gap: 10, marginHorizontal: 32, marginTop: 10 },
  stat: {
    height: 88,
    flex: 1,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
  },
  statNumber: { fontFamily: F.bold, fontSize: 30 },
  receiptWrap: {
    marginHorizontal: 33,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 3 },
  },
  receipt: {
    minHeight: 405,
    backgroundColor: C.cream,
    padding: 20,
    position: "relative",
  },
  receiptShareButton: {
    position: "absolute",
    right: 14,
    top: 14,
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "rgba(204,36,44,.4)",
    backgroundColor: "rgba(204,36,44,.08)",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    zIndex: 2,
  },
  receiptShareText: { fontFamily: F.bold, fontSize: 10, color: C.red },
  receiptLogo: {
    fontFamily: F.display,
    fontSize: 18,
    textAlign: "center",
    marginVertical: 16,
  },
  dash: {
    borderTopWidth: 1,
    borderStyle: "dashed",
    borderColor: "#ddd",
    marginBottom: 16,
  },
  feedContent: { paddingBottom: 18 },
  feedSectionHeader: {
    marginHorizontal: 32,
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  friendStrip: {
    paddingHorizontal: 22,
    gap: 2,
    marginTop: 12,
  },
  friendDrink: { width: 77, alignItems: "center" },
  friendComposite: { width: 77, height: 120 },
  friendImage: {
    width: 70,
    height: 100,
    backgroundColor: "rgba(250,255,242,.8)",
    borderRadius: 9,
  },
  friendName: { fontFamily: F.bold, fontSize: 7, maxWidth: 72 },
  friendCount: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.ink,
    marginTop: -3,
  },
  activityTitle: {
    fontFamily: F.bold,
    fontSize: 14,
    color: C.ink,
    marginHorizontal: 32,
    marginTop: 29,
  },
  activityGroup: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 15,
    color: C.ink,
    marginHorizontal: 33,
    marginTop: 5,
  },
  activity: {
    marginHorizontal: 33,
    marginTop: 10,
    borderRadius: 23,
    paddingHorizontal: 21,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activityTall: { height: 66 },
  activityShort: { height: 55 },
  activityAvatar: {
    width: 33,
    height: 33,
    borderRadius: 17,
  },
  activityCopy: { flex: 1 },
  activityAction: {
    fontFamily: F.medium,
    fontSize: 10,
    color: C.red,
    marginTop: 1,
  },
  activityQuote: {
    fontFamily: F.regular,
    fontStyle: "italic",
    color: C.ink,
  },
  activityTime: {
    fontFamily: F.regular,
    fontSize: 10,
    color: "rgba(0,0,0,.7)",
  },
  modalWrap: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,.2)",
  },
  onboard: {
    width: "100%",
    maxWidth: FIGMA_FRAME_WIDTH,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 10,
    overflow: "hidden",
  },
  handle: {
    width: 46,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#aaa",
    alignSelf: "center",
  },
  onboardTitle: {
    fontFamily: F.display,
    fontSize: 20,
    color: C.red,
    marginTop: 2,
  },
  onboardAge: { fontFamily: F.bold, fontSize: 14, color: C.ink },
  onboardCopy: {
    fontFamily: F.regular,
    fontSize: 11,
    lineHeight: 15,
    color: "rgba(32,26,27,.72)",
    marginBottom: 2,
  },
  socialButton: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(43,73,89,.25)",
    backgroundColor: "rgba(255,255,255,.82)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  socialButtonDark: { backgroundColor: C.ink, borderColor: C.ink },
  socialButtonText: { fontFamily: F.bold, fontSize: 13, color: C.ink },
  createAccountButton: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: C.red,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  createAccountText: { fontFamily: F.bold, fontSize: 13, color: C.red },
  textButton: { height: 28, alignItems: "center", justifyContent: "center" },
  textButtonText: { fontFamily: F.medium, fontSize: 11, color: C.teal },
  input: {
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,.8)",
    paddingHorizontal: 15,
    fontFamily: F.regular,
  },
  splash: {
    flex: 1,
    height: Platform.OS === "web" ? FIGMA_FRAME_HEIGHT : "100%",
    maxHeight: FIGMA_FRAME_HEIGHT,
    minHeight: 0,
    width: Platform.OS === "web" ? FIGMA_FRAME_WIDTH : "100%",
    maxWidth: FIGMA_FRAME_WIDTH,
    marginHorizontal: "auto",
    backgroundColor: "#f30",
    overflow: "hidden",
  },
  splashShade: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(255,50,0,.06)",
  },
  splashTitle: {
    position: "absolute",
    left: 25,
    top: "30%",
    fontFamily: F.display,
    fontSize: 52,
    color: "#e9fae8",
  },
});
