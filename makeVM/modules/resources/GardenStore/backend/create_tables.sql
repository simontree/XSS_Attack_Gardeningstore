CREATE TABLE sys.user (
	username varchar(100) NOT NULL,
	password varchar(100) NOT NULL,
	iban varchar(100) NULL,
	address varchar(100) NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
	email varchar(100) NOT NULL,
	CONSTRAINT user_pk PRIMARY KEY (email)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci;

CREATE TABLE sys.comments (
	author varchar(100) NOT NULL,
	`text` varchar(300) NOT NULL,
	email varchar(100) NULL,
	rating INT NULL,
	created_at DATETIME DEFAULT CURRENT_TIMESTAMP NULL,
	product_id varchar(100) NOT NULL,
	CONSTRAINT comments_pk PRIMARY KEY (author),
	CONSTRAINT comments_FK FOREIGN KEY (product_id) REFERENCES sys.products(product_id)
)
ALTER TABLE sys.comments ADD comment_id varchar(100) NULL;
ALTER TABLE sys.comments DROP PRIMARY KEY;
ALTER TABLE sys.comments ADD CONSTRAINT comments_pk PRIMARY KEY (comment_id);

ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci;

CREATE TABLE sys.products (
	product_id varchar(100) NOT NULL,
	name varchar(100) NOT NULL,
	price FLOAT NOT NULL,
	description varchar(200) NOT NULL,
	img varchar(100) NULL,
	CONSTRAINT products_pk PRIMARY KEY (product_id)
)
ENGINE=InnoDB
DEFAULT CHARSET=utf8mb3
COLLATE=utf8mb3_general_ci;
