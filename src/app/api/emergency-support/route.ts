import { NextRequest } from "next/server";

interface Resource {
  name: string;
  phone?: string;
  url: string;
  available: string;
}

interface CountryResources {
  resources: Resource[];
  emergency: string;
}

const COUNTRY_RESOURCES: Record<string, CountryResources> = {
  india: {
    resources: [
      {
        name: "iCall (TISS)",
        phone: "9152987821",
        url: "https://icallhelpline.org",
        available: "Mon–Sat, 8am–10pm IST",
      },
      {
        name: "Vandrevala Foundation Helpline",
        phone: "1860-2662-345",
        url: "https://www.vandrevalafoundation.com",
        available: "24/7",
      },
      {
        name: "AASRA",
        phone: "9820466726",
        url: "http://www.aasra.info",
        available: "24/7",
      },
      {
        name: "NIMHANS Helpline",
        phone: "080-46110007",
        url: "https://nimhans.ac.in",
        available: "24/7",
      },
    ],
    emergency: "112",
  },
  "united states": {
    resources: [
      {
        name: "National Suicide Prevention Lifeline",
        phone: "988",
        url: "https://988lifeline.org",
        available: "24/7",
      },
      {
        name: "Crisis Text Line",
        phone: "Text HOME to 741741",
        url: "https://www.crisistextline.org",
        available: "24/7",
      },
      {
        name: "SAMHSA National Helpline",
        phone: "1-800-662-4357",
        url: "https://www.samhsa.gov/find-help/national-helpline",
        available: "24/7, 365 days a year",
      },
    ],
    emergency: "911",
  },
  "united kingdom": {
    resources: [
      {
        name: "Samaritans",
        phone: "116 123",
        url: "https://www.samaritans.org",
        available: "24/7",
      },
      {
        name: "Mind Infoline",
        phone: "0300 123 3393",
        url: "https://www.mind.org.uk",
        available: "Mon–Fri, 9am–6pm",
      },
      {
        name: "Crisis Text Line UK",
        phone: "Text SHOUT to 85258",
        url: "https://giveusashout.org",
        available: "24/7",
      },
    ],
    emergency: "999",
  },
  canada: {
    resources: [
      {
        name: "Talk Suicide Canada",
        phone: "988",
        url: "https://talksuicide.ca",
        available: "24/7",
      },
      {
        name: "Crisis Text Line Canada",
        phone: "Text HOME to 686868",
        url: "https://www.crisistextline.ca",
        available: "24/7",
      },
      {
        name: "Kids Help Phone",
        phone: "1-800-668-6868",
        url: "https://kidshelpphone.ca",
        available: "24/7",
      },
    ],
    emergency: "911",
  },
  australia: {
    resources: [
      {
        name: "Lifeline Australia",
        phone: "13 11 14",
        url: "https://www.lifeline.org.au",
        available: "24/7",
      },
      {
        name: "Beyond Blue",
        phone: "1300 22 4636",
        url: "https://www.beyondblue.org.au",
        available: "24/7",
      },
      {
        name: "Kids Helpline",
        phone: "1800 55 1800",
        url: "https://kidshelpline.com.au",
        available: "24/7",
      },
    ],
    emergency: "000",
  },
};

// Fallback for unknown countries
const DEFAULT_RESOURCES: CountryResources = {
  resources: [
    {
      name: "International Association for Suicide Prevention",
      url: "https://www.iasp.info/resources/Crisis_Centres/",
      available: "Directory of crisis centers worldwide",
    },
    {
      name: "Befrienders Worldwide",
      url: "https://befrienders.org/find-support/",
      available: "Find a helpline in your country",
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      url: "https://www.crisistextline.org",
      available: "24/7 (US, UK, Canada, Ireland)",
    },
  ],
  emergency: "your local emergency number",
};

export async function GET(request: NextRequest) {
  const country = request.nextUrl.searchParams
    .get("country")
    ?.toLowerCase()
    .trim();

  const matched = country
    ? COUNTRY_RESOURCES[country] || DEFAULT_RESOURCES
    : DEFAULT_RESOURCES;

  const emergencyNum = matched.emergency;

  return Response.json({
    message:
      "If you're in crisis or need immediate support, please reach out to one of these resources:",
    resources: matched.resources,
    disclaimer: `This is not a substitute for professional help. If you are in immediate danger, please call emergency services (${emergencyNum}).`,
  });
}
