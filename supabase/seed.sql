insert into public.flavour_tags (name)
values
  ('Citrusy'),
  ('Fresh'),
  ('Tangy'),
  ('Sweet'),
  ('Strong'),
  ('Floral'),
  ('Nutty'),
  ('Bitter'),
  ('Creamy'),
  ('Refreshing'),
  ('Tarty'),
  ('Fizzy'),
  ('Bubblegum')
on conflict (name) do nothing;

insert into public.badges (id, name, description, target)
values
  ('first-sip', 'First Sip', 'Publish your first review.', 1),
  ('five-sips', 'Five Sips', 'Review five different drinks.', 5),
  ('ten-sips', 'Ten Sips', 'Review ten different drinks.', 10),
  ('social-sipper', 'Social Sipper', 'Connect with ten buddies.', 10)
on conflict (id) do update
set
  name = excluded.name,
  description = excluded.description,
  target = excluded.target;
