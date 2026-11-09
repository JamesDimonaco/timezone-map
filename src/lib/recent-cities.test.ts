import { describe, expect, it } from "vitest";
import { MAX_RECENT_CITIES, addRecentCity, parseRecentCities } from "./recent-cities";

describe("addRecentCity", () => {
  it("puts the newest city first", () => {
    expect(addRecentCity(["london"], "tokyo")).toEqual(["tokyo", "london"]);
  });

  it("moves a repeat view to the front instead of adding it twice", () => {
    expect(addRecentCity(["tokyo", "london", "auckland"], "auckland")).toEqual([
      "auckland",
      "tokyo",
      "london",
    ]);
  });

  it("keeps at most 5 cities, dropping the oldest", () => {
    expect(MAX_RECENT_CITIES).toBe(5);
    const full = ["a", "b", "c", "d", "e"];
    expect(addRecentCity(full, "f")).toEqual(["f", "a", "b", "c", "d"]);
  });
});

describe("parseRecentCities", () => {
  it("reads a stored list", () => {
    expect(parseRecentCities('["auckland","london"]')).toEqual(["auckland", "london"]);
  });

  it("returns an empty list when nothing is stored", () => {
    expect(parseRecentCities(null)).toEqual([]);
  });

  it("returns an empty list for corrupt or wrong-shaped data", () => {
    expect(parseRecentCities("{not json")).toEqual([]);
    expect(parseRecentCities('{"a":1}')).toEqual([]);
    expect(parseRecentCities("42")).toEqual([]);
  });

  it("drops non-string entries, duplicates and anything past the cap", () => {
    expect(parseRecentCities('["a",1,null,"a","b","c","d","e","f"]')).toEqual([
      "a",
      "b",
      "c",
      "d",
      "e",
    ]);
  });
});
