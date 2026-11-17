/** The authenticated user a service call runs as (GLOSSARY: Actor). */
export interface Actor {
  userId: string;
}

/** Builds the actor for a user returned by a factory. */
export function asUser(user: { id: string }): Actor {
  return { userId: user.id };
}
