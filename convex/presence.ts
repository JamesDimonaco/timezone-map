import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";

export const heartbeat = mutation({
  args: {
    sessionId: v.string(),
    fuzzedLat: v.number(),
    fuzzedLng: v.number(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    // Input validation
    if (args.fuzzedLat < -90 || args.fuzzedLat > 90) return;
    if (args.fuzzedLng < -180 || args.fuzzedLng > 180) return;
    if (!args.timezone.includes("/")) return;

    const existing = await ctx.db
      .query("presence")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        fuzzedLat: args.fuzzedLat,
        fuzzedLng: args.fuzzedLng,
        timezone: args.timezone,
        lastSeen: Date.now(),
      });
    } else {
      await ctx.db.insert("presence", {
        ...args,
        lastSeen: Date.now(),
      });
    }
  },
});

export const getActiveUsers = query({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 60_000;
    const users = await ctx.db
      .query("presence")
      .withIndex("by_last_seen", (q) => q.gt("lastSeen", cutoff))
      .collect();

    return {
      count: users.length,
      users: users.map((u) => ({
        fuzzedLat: u.fuzzedLat,
        fuzzedLng: u.fuzzedLng,
        timezone: u.timezone,
      })),
    };
  },
});

export const cleanupStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - 60_000;
    const stale = await ctx.db
      .query("presence")
      .withIndex("by_last_seen", (q) => q.lt("lastSeen", cutoff))
      .collect();

    for (const entry of stale) {
      await ctx.db.delete(entry._id);
    }
  },
});
