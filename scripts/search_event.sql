SELECT DISTINCT h.event_id, event_name, event_start_date, end_date, start_time, end_time, card_no, staff_id, e_location, branch_id
FROM lib_events as l, coordinates as c, event_location as el, hosts_event as h
WHERE h.event_id = l.event_id 
	AND c.event_id = el.event_id
  AND h.event_id = el.event_id
  AND c.event_id = l.event_id
	AND (event_name LIKE '%Fam%' 
		OR e_location like '%Fam%'
		OR event_start_date like '%Fam%'
		OR end_date like '%Fam%'
		OR start_time like '%Fam%'
    OR end_time like '%Fam%'
);