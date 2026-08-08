# Firestore Security Specification

## Data Invariants
1. Users can only read, create, update, or delete their own user document (`/users/{userId}`).
2. API Collections (`/users/{userId}/collections/{collectionId}`) must be owned by `{userId}` matching `request.auth.uid`.
3. Traffic Rules (`/users/{userId}/rules/{ruleId}`) must be owned by `{userId}` matching `request.auth.uid`.
4. Anonymous or unauthenticated requests are denied access to all user collections and documents.

## "Dirty Dozen" Threat Vectors Covered
1. ID Spoofing: Attempting to write into another user's path (`/users/otherUser`).
2. Missing Auth: Attempting unauthenticated reads or writes.
3. Oversized Strings: Payload containing fields larger than allowed `maxLength`.
4. Malformed Keys: Adding unauthorized root keys to documents.
5. Insecure List Scraping: Performing list queries without specifying `request.auth.uid`.
6. Self-assigned Roles: Modifying system user parameters.
7. Type Poisoning: Sending numbers in string properties.
8. Unbounded Arrays: Sending unlimited array elements.
9. Privilege Escalation: Bypassing owner checks.
10. Null Pointer Invalidation: Requesting resource data on create/delete without checks.
11. Path Invalidation: Using illegal characters in document path IDs.
12. Temporal Corruption: Spoofing system timestamps.
