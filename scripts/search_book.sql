SELECT b.item_id, b.publisher_name, b.isbn, i.release_date, i.item_desc, i.item_name, a.author_name 
FROM book as b, item as i, writes as w, author as a WHERE 
			i.item_id = b.item_id AND w.item_id = i.item_id 
			AND a.author_id = w.author_id
            AND (item_desc LIKE '%%' 
                OR item_name LIKE '%%' 
                OR publisher_name like '%%'
				OR author_name like '%%'
                OR b.isbn like '%%'
                OR item_desc like '%%'
                );