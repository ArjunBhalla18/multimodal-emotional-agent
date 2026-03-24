export async function GET() {
  return Response.json({
    message:
      "If you're in crisis or need immediate support, please reach out to one of these resources:",
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
      {
        name: "International Association for Suicide Prevention",
        url: "https://www.iasp.info/resources/Crisis_Centres/",
        available: "Directory of crisis centers worldwide",
      },
    ],
    disclaimer:
      "This is not a substitute for professional help. If you are in immediate danger, please call emergency services (911 in the US).",
  });
}
