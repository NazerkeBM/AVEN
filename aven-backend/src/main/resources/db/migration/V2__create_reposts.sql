CREATE TABLE reposts (

                         user_id BIGINT NOT NULL,

                         image_id BIGINT NOT NULL,

                         created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

                         CONSTRAINT reposts_pkey
                             PRIMARY KEY (user_id, image_id),

                         CONSTRAINT reposts_user_fk
                             FOREIGN KEY (user_id)
                                 REFERENCES users(id)
                                 ON DELETE CASCADE,

                         CONSTRAINT reposts_image_fk
                             FOREIGN KEY (image_id)
                                 REFERENCES images(id)
                                 ON DELETE CASCADE

);

CREATE INDEX idx_reposts_image_id
    ON reposts(image_id);