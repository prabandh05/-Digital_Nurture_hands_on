# ANSI SQL Using MySQL — Exercise Solutions

This file contains SQL queries (MySQL-compatible) for the exercises in the Module 2 workbook. They assume the following table names and columns:

- `users` (`user_id`, `full_name`, `email`, `city`, `registration_date`)
- `events` (`event_id`, `title`, `description`, `city`, `start_date`, `end_date`, `status`, `organizer_id`)
- `sessions` (`session_id`, `event_id`, `title`, `speaker_name`, `start_time`, `end_time`)
- `registrations` (`registration_id`, `user_id`, `event_id`, `registration_date`)
- `feedback` (`feedback_id`, `user_id`, `event_id`, `rating`, `comments`, `feedback_date`)
- `resources` (`resource_id`, `event_id`, `resource_type`, `resource_url`, `uploaded_at`)

Notes:
- Replace table/column names if your schema differs.
- Date arithmetic uses MySQL functions (e.g., `CURDATE()`, `DATE_SUB`).

---

## 1. User Upcoming Events
Show a list of all upcoming events a user is registered for in their city, sorted by date.

```sql
SELECT e.event_id,
       e.title,
       e.city,
       e.start_date,
       e.end_date,
       r.user_id
FROM events e
JOIN registrations r ON r.event_id = e.event_id
JOIN users u ON u.user_id = r.user_id
WHERE e.status = 'upcoming'
  AND e.city = u.city
  AND u.user_id = ? -- bind the target user id
ORDER BY e.start_date;
```

## 2. Top Rated Events
Identify events with the highest average rating, considering only those that have received at least 10 feedback submissions.

```sql
SELECT f.event_id,
       e.title,
       AVG(f.rating) AS avg_rating,
       COUNT(*) AS feedback_count
FROM feedback f
JOIN events e ON e.event_id = f.event_id
GROUP BY f.event_id, e.title
HAVING COUNT(*) >= 10
ORDER BY avg_rating DESC;
```

## 3. Inactive Users
Retrieve users who have not registered for any events in the last 90 days.

```sql
SELECT u.*
FROM users u
LEFT JOIN registrations r ON r.user_id = u.user_id
  AND r.registration_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)
WHERE r.registration_id IS NULL;
```

## 4. Peak Session Hours
Count how many sessions are scheduled between 10 AM to 12 PM for each event.

```sql
SELECT s.event_id,
       e.title,
       SUM(
         (TIME(s.start_time) >= '10:00:00' AND TIME(s.start_time) < '12:00:00')
         OR
         (TIME(s.end_time) > '10:00:00' AND TIME(s.end_time) <= '12:00:00')
       ) AS sessions_between_10_12
FROM sessions s
JOIN events e ON e.event_id = s.event_id
GROUP BY s.event_id, e.title;
```

Note: MySQL treats boolean expressions as 1/0 in numeric context.

## 5. Most Active Cities
List the top 5 cities with the highest number of distinct user registrations.

```sql
SELECT e.city,
       COUNT(DISTINCT r.user_id) AS distinct_registrations
FROM registrations r
JOIN events e ON e.event_id = r.event_id
GROUP BY e.city
ORDER BY distinct_registrations DESC
LIMIT 5;
```

## 6. Event Resource Summary
Generate a report showing the number of resources (PDFs, images, links) uploaded for each event.

```sql
SELECT e.event_id,
       e.title,
       SUM(resource_type = 'pdf') AS pdf_count,
       SUM(resource_type = 'image') AS image_count,
       SUM(resource_type = 'link') AS link_count,
       COUNT(*) AS total_resources
FROM resources r
JOIN events e ON e.event_id = r.event_id
GROUP BY e.event_id, e.title;
```

## 7. Low Feedback Alerts
List all users who gave feedback with a rating less than 3, along with their comments and associated event names.

```sql
SELECT f.feedback_id,
       f.user_id,
       u.full_name,
       f.event_id,
       e.title AS event_title,
       f.rating,
       f.comments,
       f.feedback_date
FROM feedback f
JOIN users u ON u.user_id = f.user_id
JOIN events e ON e.event_id = f.event_id
WHERE f.rating < 3
ORDER BY f.feedback_date DESC;
```

## 8. Sessions per Upcoming Event
Display all upcoming events with the count of sessions scheduled for them.

```sql
SELECT e.event_id,
       e.title,
       e.start_date,
       e.end_date,
       COUNT(s.session_id) AS session_count
FROM events e
LEFT JOIN sessions s ON s.event_id = e.event_id
WHERE e.status = 'upcoming'
GROUP BY e.event_id, e.title, e.start_date, e.end_date
ORDER BY e.start_date;
```

## 9. Organizer Event Summary
For each event organizer, show the number of events created and their current status (counts by status).

```sql
SELECT o.user_id AS organizer_id,
       o.full_name AS organizer_name,
       COUNT(e.event_id) AS total_events,
       SUM(e.status = 'upcoming') AS upcoming_count,
       SUM(e.status = 'completed') AS completed_count,
       SUM(e.status = 'cancelled') AS cancelled_count
FROM users o
LEFT JOIN events e ON e.organizer_id = o.user_id
GROUP BY o.user_id, o.full_name
ORDER BY total_events DESC;
```

## 10. Feedback Gap
Identify events that had registrations but received no feedback at all.

```sql
SELECT e.event_id,
       e.title,
       COUNT(DISTINCT r.registration_id) AS registrations_count
FROM events e
JOIN registrations r ON r.event_id = e.event_id
LEFT JOIN feedback f ON f.event_id = e.event_id
WHERE f.feedback_id IS NULL
GROUP BY e.event_id, e.title
HAVING COUNT(DISTINCT r.registration_id) > 0;
```

## 11. Daily New User Count
Find the number of users who registered each day in the last 7 days.

```sql
SELECT DATE(u.registration_date) AS reg_date,
       COUNT(*) AS new_users
FROM users u
WHERE u.registration_date >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
GROUP BY DATE(u.registration_date)
ORDER BY reg_date DESC;
```

## 12. Event with Maximum Sessions
List the event(s) with the highest number of sessions.

```sql
SELECT e.event_id,
       e.title,
       COUNT(s.session_id) AS session_count
FROM events e
LEFT JOIN sessions s ON s.event_id = e.event_id
GROUP BY e.event_id, e.title
HAVING session_count = (
  SELECT MAX(cnt) FROM (
    SELECT COUNT(*) AS cnt
    FROM sessions
    GROUP BY event_id
  ) t
);
```

## 13. Average Rating per City
Calculate the average feedback rating of events conducted in each city.

```sql
SELECT e.city,
       AVG(f.rating) AS avg_rating,
       COUNT(f.feedback_id) AS feedback_count
FROM feedback f
JOIN events e ON e.event_id = f.event_id
GROUP BY e.city
ORDER BY avg_rating DESC;
```

## 14. Most Registered Events
List top 3 events based on the total number of user registrations.

```sql
SELECT e.event_id,
       e.title,
       COUNT(r.registration_id) AS registrations_count
FROM events e
LEFT JOIN registrations r ON r.event_id = e.event_id
GROUP BY e.event_id, e.title
ORDER BY registrations_count DESC
LIMIT 3;
```

## 15. Event Session Time Conflict
Identify overlapping sessions within the same event.

```sql
SELECT s1.event_id,
       s1.session_id AS session_a,
       s1.title AS title_a,
       s2.session_id AS session_b,
       s2.title AS title_b
FROM sessions s1
JOIN sessions s2 ON s1.event_id = s2.event_id
  AND s1.session_id < s2.session_id
  AND NOT (s1.end_time <= s2.start_time OR s2.end_time <= s1.start_time);
```

## 16. Unregistered Active Users
Find users who created an account in the last 30 days but haven’t registered for any events.

```sql
SELECT u.*
FROM users u
LEFT JOIN registrations r ON r.user_id = u.user_id
WHERE u.registration_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
  AND r.registration_id IS NULL;
```

## 17. Multi-Session Speakers
Identify speakers who are handling more than one session across all events.

```sql
SELECT speaker_name,
       COUNT(*) AS session_count
FROM sessions
GROUP BY speaker_name
HAVING session_count > 1;
```

## 18. Resource Availability Check
List all events that do not have any resources uploaded.

```sql
SELECT e.event_id,
       e.title
FROM events e
LEFT JOIN resources r ON r.event_id = e.event_id
WHERE r.resource_id IS NULL;
```

## 19. Completed Events with Feedback Summary
For completed events, show total registrations and average feedback rating.

```sql
SELECT e.event_id,
       e.title,
       COUNT(DISTINCT r.registration_id) AS registrations_count,
       AVG(f.rating) AS avg_rating
FROM events e
LEFT JOIN registrations r ON r.event_id = e.event_id
LEFT JOIN feedback f ON f.event_id = e.event_id
WHERE e.status = 'completed'
GROUP BY e.event_id, e.title;
```

## 20. User Engagement Index
For each user, calculate how many events they attended and how many feedbacks they submitted.

```sql
SELECT u.user_id,
       u.full_name,
       COUNT(DISTINCT r.event_id) AS events_attended,
       COUNT(DISTINCT f.feedback_id) AS feedbacks_submitted
FROM users u
LEFT JOIN registrations r ON r.user_id = u.user_id
LEFT JOIN feedback f ON f.user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY events_attended DESC, feedbacks_submitted DESC;
```

## 21. Top Feedback Providers
List top 5 users who have submitted the most feedback entries.

```sql
SELECT u.user_id,
       u.full_name,
       COUNT(f.feedback_id) AS feedback_count
FROM users u
JOIN feedback f ON f.user_id = u.user_id
GROUP BY u.user_id, u.full_name
ORDER BY feedback_count DESC
LIMIT 5;
```

## 22. Duplicate Registrations Check
Detect if a user has been registered more than once for the same event.

```sql
SELECT user_id,
       event_id,
       COUNT(*) AS reg_count,
       GROUP_CONCAT(registration_id ORDER BY registration_date) AS registrations
FROM registrations
GROUP BY user_id, event_id
HAVING reg_count > 1;
```

## 23. Registration Trends
Show a month-wise registration count trend over the past 12 months.

```sql
SELECT DATE_FORMAT(r.registration_date, '%Y-%m') AS year_month,
       COUNT(*) AS registrations
FROM registrations r
WHERE r.registration_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
GROUP BY year_month
ORDER BY year_month;
```

## 24. Average Session Duration per Event
Compute the average duration (in minutes) of sessions in each event.

```sql
SELECT s.event_id,
       e.title,
       AVG(TIMESTAMPDIFF(MINUTE, s.start_time, s.end_time)) AS avg_duration_minutes
FROM sessions s
JOIN events e ON e.event_id = s.event_id
GROUP BY s.event_id, e.title;
```

## 25. Events Without Sessions
List all events that currently have no sessions scheduled under them.

```sql
SELECT e.event_id,
       e.title
FROM events e
LEFT JOIN sessions s ON s.event_id = e.event_id
WHERE s.session_id IS NULL;
```

---

If you want, I can also generate a SQL file with these queries or run simple validations. Would you like that?
