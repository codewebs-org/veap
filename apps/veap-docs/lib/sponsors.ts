export type SponsorTierId = "diamond" | "gold" | "silver";

export type SponsorTier = {
  id: SponsorTierId;
  name: string;
  price: number;
  perks: string[];
  featured?: boolean;
};

export const SPONSOR_X_URL = "https://x.com/veapjs";

export const TIERS: SponsorTier[] = [
  {
    id: "diamond",
    name: "Diamond",
    price: 150,
    featured: true,
    perks: [
      "Largest logo on the sponsors page",
      "Largest logo on the home page",
      "Largest logo in the README",
      "Shoutout on X",
      "Direct line for feedback and requests",
    ],
  },
  {
    id: "gold",
    name: "Gold",
    price: 100,
    perks: [
      "Larger logo on the sponsors page",
      "Logo on the home page",
      "Larger logo in the README",
      "Shoutout on X",
    ],
  },
  {
    id: "silver",
    name: "Silver",
    price: 50,
    perks: ["Logo in the README", "Listed on the sponsors page"],
  },
];
