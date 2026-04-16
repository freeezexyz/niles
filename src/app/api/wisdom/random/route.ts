import { NextResponse } from "next/server";

const WISDOM_QUOTES = [
  {
    quote: "Build trust like you build a pyramid \u2014 one stone at a time, each placed with purpose.",
    principle: "trust",
    chapter: 6,
  },
  {
    quote: "The Pharaoh who studies his land, its rivers and its people, will never be surprised by drought.",
    principle: "knowledge",
    chapter: 3,
  },
  {
    quote: "A sale driven by purpose will outlast one driven by commission, just as a pyramid built with conviction will outlast one built with haste.",
    principle: "purpose",
    chapter: 1,
  },
  {
    quote: "Paint the future your client cannot yet see. That is the gift of the visionary \u2014 to show what is possible before it exists.",
    principle: "visioning",
    chapter: 2,
  },
  {
    quote: "Sell from the heart, and the head will follow. Kindness is not weakness \u2014 it is the strongest foundation of any lasting relationship.",
    principle: "kindness",
    chapter: 4,
  },
  {
    quote: "A servant leader does not stand above his people. He stands beside them, and in doing so, earns the trust of the Pharaoh.",
    principle: "leadership",
    chapter: 5,
  },
  {
    quote: "Read the room, feel the moment, win the relationship. The emotionally intelligent salesperson sees what others miss.",
    principle: "emotional",
    chapter: 7,
  },
  {
    quote: "Howard Carter did not find Tutankhamun\u2019s tomb by luck. He found it through years of relentless purpose and unyielding belief.",
    principle: "purpose",
    chapter: 1,
  },
  {
    quote: "Know your client better than they know themselves. The wise Imhotep did not build the first pyramid by guessing \u2014 he studied, planned, and understood.",
    principle: "knowledge",
    chapter: 3,
  },
  {
    quote: "Trust is the currency that closes every deal. Without it, even the most brilliant pitch falls on deaf ears.",
    principle: "trust",
    chapter: 6,
  },
  {
    quote: "Cleopatra did not charm Rome with force. She charmed it with emotional intelligence \u2014 the ability to read the room and respond with precision.",
    principle: "emotional",
    chapter: 7,
  },
  {
    quote: "The Nile does not force its way to the sea. It nourishes everything in its path. Be the Nile in your client\u2019s journey.",
    principle: "kindness",
    chapter: 4,
  },
  {
    quote: "A vision without action is a mirage in the desert. A vision with action is a pyramid that stands for millennia.",
    principle: "visioning",
    chapter: 2,
  },
  {
    quote: "The best salespeople are not closers. They are openers \u2014 they open doors, open minds, and open possibilities.",
    principle: "leadership",
    chapter: 5,
  },
];

export async function GET() {
  const randomIndex = Math.floor(Math.random() * WISDOM_QUOTES.length);
  return NextResponse.json(WISDOM_QUOTES[randomIndex]);
}
