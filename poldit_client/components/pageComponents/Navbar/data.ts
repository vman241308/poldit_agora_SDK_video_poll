export interface NavType {
  id: number | string;
  link: string;
  url?: string;
}

export interface Pollquestion {
  id: number;
  question: string;
  images: boolean;
  type: string;
}

export const NavLinks: NavType[] = [
  { id: 1, link: "Profile", url: "Profile" },
  { id: 2, link: "All Topics", url: "Topics" },
  { id: 3, link: "Contact", url: "Contact" },
  { id: 4, link: "About Poldit", url: "About" },
  // { id: 7, link: "Settings", url: "Profile" },
];

