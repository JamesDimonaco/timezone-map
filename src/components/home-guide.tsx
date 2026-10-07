import Link from "next/link";
import { FaqList, type FaqItem } from "@/components/faq-list";
import { timezoneCities } from "@/lib/timezones";

const FAQS: FaqItem[] = [
  {
    question: "How do I convert a time from one city to another?",
    answer:
      "Type the time and the city into the converter, for example \"6pm London\" or \"3pm EST\". It shows the same moment in your local time. To compare two cities directly, open a page like London to New York, which lists every hour side by side.",
  },
  {
    question: "Why does the time difference between two cities change during the year?",
    answer:
      "Daylight saving time starts and ends on different dates in different places. The US moves its clocks on the second Sunday of March and the first Sunday of November. Most of Europe moves on the last Sunday of March and the last Sunday of October. For a few weeks each spring and autumn the gap between New York and London is 4 hours instead of 5.",
  },
  {
    question: "Which countries don't use daylight saving time?",
    answer:
      "Most of Asia and Africa, including India, Japan, China and Singapore, keep the same clock time all year. So do Arizona (apart from the Navajo Nation), Hawaii, and many countries near the equator. Countries in the southern hemisphere that do observe it, like Australia and New Zealand, change clocks in the opposite season to Europe and North America.",
  },
  {
    question: "What is the best time to schedule a meeting across time zones?",
    answer:
      "Find the hours where everyone is inside their working day. The team planner takes up to five cities and highlights the overlap. For cities eight or more hours apart, such as San Francisco and Singapore, there is usually no shared 9-to-5 window and someone takes an early or late slot.",
  },
  {
    question: "Are time zones always a whole number of hours from UTC?",
    answer:
      "No. India is UTC+5:30, Nepal is UTC+5:45, and parts of Australia use UTC+9:30. The Chatham Islands in New Zealand use UTC+12:45. The full range runs from UTC-12 to UTC+14.",
  },
];

export function HomeGuide() {
  return (
    <section className="w-full max-w-2xl mx-auto px-4 pt-4 pb-6 text-sm leading-relaxed">
      <h2 className="text-xl font-semibold mb-3">How time zones work</h2>
      <div className="space-y-3 text-muted-foreground mb-10">
        <p>
          The world is split into time zones so that noon is roughly when the
          sun is highest. Every zone is described as an offset from UTC
          (Coordinated Universal Time), the reference clock that does not change
          with the seasons. London in winter is UTC+0, New York is UTC-5, and
          Tokyo is UTC+9, so when it is 12:00 in London it is 07:00 in New York
          and 21:00 in Tokyo.
        </p>
        <p>
          Borders matter as much as longitude. China spans about five
          geographic zones but runs on a single clock, UTC+8. Russia uses
          eleven. Kiribati sits at UTC+14, which puts it more than a day ahead of
          Baker Island at UTC-12. The International Date Line is where one
          calendar day ends and the next begins.
        </p>
        <p>
          Daylight saving time is what makes conversions go wrong. A city&apos;s
          offset can change twice a year, and two cities do not always change on
          the same day. A meeting set for &quot;9am New York time&quot; lands at
          a different hour in London depending on the week, which is why this
          site works from the live rules for each location instead of a fixed
          offset.
        </p>
      </div>

      <h2 className="text-xl font-semibold mb-3">What you can do here</h2>
      <ul className="space-y-2 text-muted-foreground mb-10 list-disc pl-5">
        <li>
          Convert a time from any of {timezoneCities.length}+ cities to your
          local time with the converter above.
        </li>
        <li>
          Open the{" "}
          <Link href="/time" className="underline hover:text-foreground">
            city index
          </Link>{" "}
          for the current time, UTC offset, daylight saving dates and sunrise
          and sunset in each city.
        </li>
        <li>
          Use the{" "}
          <Link href="/compare" className="underline hover:text-foreground">
            team planner
          </Link>{" "}
          to compare up to five cities and find the hours when everyone is
          working.
        </li>
        <li>
          Explore the interactive map to see every zone, the day and night
          boundary, and the midnight line move in real time.
        </li>
        <li>
          Read the{" "}
          <Link href="/api/docs" className="underline hover:text-foreground">
            free API docs
          </Link>{" "}
          to get the same data in your own app.
        </li>
      </ul>

      <FaqList items={FAQS} heading="Common questions" />
    </section>
  );
}
