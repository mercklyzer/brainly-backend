-- FOR USERS

-- CREATING TABLE
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `userId` VARCHAR(30) NOT NULL,
    `username` VARCHAR(16) NOT NULL,
    `email`  VARCHAR(64) NOT NULL,
    `profilePicture` VARCHAR(110) DEFAULT '',
    `password` VARCHAR(110) NOT NULL,
    `birthday` DATE NOT NULL,
    `level` ENUM('Junior High', 'Senior High', 'College'),
    `currentPoints` INT DEFAULT 90,
    `thanksCtr` INT DEFAULT 0,

    PRIMARY KEY (`userId`)
);

-- INITIAL ENTRIES OF THE USERS TABLE
INSERT INTO `users` (
    `userId`,
    `username`,
    `password`,
    `email`,
    `birthday`,
    `profilePicture`,
    `level`,
    `currentPoints`,
    `thanksCtr`
)
VALUES 
('1', 'merck123', '12345', 'merck123@gmail.com', DATE('1999-12-12'), '/sample1.jpg', 'Senior High', 90,  0),
('2', 'lababa11', '12345', 'lalabbaa@gmail.com', DATE('1999-12-12'), '/sample2.jpg', 'College', 40,  0),
('3', 'lyzer0101', '12345', 'rezyl1116@gmail.com', DATE('1979-1-11'), '/sample3.jpg', 'College', 857,  0),
('4', 'nani0101', 'xdmap123', 'nani@gmail.com', DATE('2001-12-12'), '/sample4.jpg', 'Senior High', 12,  0),
('5', 'account5', '12345', 'account5@gmail.com', DATE('2001-12-12'), '/sample5.jpg', 'Senior High', 42,  0);

-- GETTING ALL USERS PROCEDURE
DROP PROCEDURE IF EXISTS `get_users`;
CREATE PROCEDURE `get_users` ()
BEGIN
	SELECT * FROM `users`;
END;

-- ADDING A SINGLE USER PROCEDURE
DROP PROCEDURE IF EXISTS `add_user`;
CREATE PROCEDURE `add_user` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_password` VARCHAR(110),
    IN `p_email`  VARCHAR(64),
    IN `p_profilePicture` VARCHAR(110),
    IN `p_birthday` DATE,
    IN `p_level` ENUM('Junior High', 'Senior High', 'College')
)
BEGIN
    INSERT INTO `users` (`userId`, `username`, `password`, `email`, `profilePicture`, `birthday`, `level`) 
    VALUES (`p_userId`, `p_username`, `p_password`, `p_email`, `p_profilePicture`, `p_birthday`, `p_level`);
    SELECT * FROM `users` WHERE `userId` = `p_userId`;
END;

-- EDITING A USER PROCEDURE
DROP PROCEDURE IF EXISTS `edit_user`;
CREATE PROCEDURE `edit_user` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_email`  VARCHAR(64),
    IN `p_password` VARCHAR(110),
    IN `p_level` ENUM('Junior High', 'Senior High', 'College'),
    IN `p_profilePicture` VARCHAR(110)
)
BEGIN
    UPDATE `users` SET `username` = `p_username`, `email` = `p_email`, `password` = `p_password`, `profilePicture` = `p_profilePicture`, `level` = `p_level` 
    WHERE `userId` = `p_userId`;
END;

-- GETTING A USER BY EMAIL PROCEDURE
DROP PROCEDURE IF EXISTS `get_user_by_email`;
CREATE PROCEDURE `get_user_by_email` (
    IN `p_email` VARCHAR(64)
)
BEGIN
    SELECT * FROM `users` WHERE `email` = `p_email`;
END;

-- GETTING A USER BY USERNAME PROCEDURE
DROP PROCEDURE IF EXISTS `get_user_by_username`;
CREATE PROCEDURE `get_user_by_username` (
    IN `p_username` VARCHAR(16)
)
BEGIN
    SELECT * FROM `users` WHERE `username` = `p_username`;
END;

-- GETTING A USER BY USER ID PROCEDURE
DROP PROCEDURE IF EXISTS `get_user_by_user_id`;
CREATE PROCEDURE `get_user_by_user_id` (
    IN `p_user_id` VARCHAR(64)
)
BEGIN
SELECT 
    `t`.`userId`,
    `t`.`username`,
    `t`.`email`,
    `t`.`password`,
    `t`.`profilePicture`,
    `t`.`birthday`,
    `t`.`level`,
    `t`.`currentPoints`,
    SUM(`t`.`isBrainliest`) `brainliestCtr`,
    SUM(`t`.`isAnswer`) `answersCtr`
FROM
    (SELECT 
        `users`.`userId`,
            `users`.`username`,
            `users`.`email`,
            `users`.`password`,
            `users`.`profilePicture`,
            `users`.`birthday`,
            `users`.`level`,
            `users`.`currentPoints`,
            CASE
                WHEN `answers`.`isBrainliest` IS NULL THEN 0
                ELSE `answers`.`isBrainliest`
            END AS `isBrainliest`,
            CASE
                WHEN `answers`.`isAnswer` IS NULL THEN 0
                ELSE `answers`.`isAnswer`
            END AS `isAnswer`
    FROM
        `users`
    LEFT JOIN `answers` ON `users`.`userId` = `answers`.`userId`
    WHERE `users`.`userId` = `p_user_id`) AS t
GROUP BY `t`.`userId`;

END;

-- UPDATING USER'S ANSWER CTR PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_answers_ctr`;
CREATE PROCEDURE `update_user_answers_ctr` (
    IN `p_user_id` VARCHAR(30),
    IN `p_new_answers_ctr` INT
)
BEGIN
    UPDATE `users` SET `answersCtr` = `p_new_answers_ctr` WHERE `userId` = `p_user_id`;
END;

-- UPDATING USER'S CURRENT POINTS PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_current_points`;
CREATE PROCEDURE `update_user_current_points` (
    IN `p_user_id` VARCHAR(30),
    IN `p_new_points` INT
)
BEGIN
    UPDATE `users` SET `currentPoints` = `p_new_points` WHERE `userId` = `p_user_id`;
END;

-- UPDATING USER'S BRAINLEST CTR PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_brainliest_ctr`;
CREATE PROCEDURE `update_user_brainliest_ctr` (
    IN `p_user_id` VARCHAR(30),
    IN `p_brainliest_ctr` INT
)
BEGIN
    UPDATE `users` SET `brainliestCtr` = `p_brainliest_ctr` WHERE `userId` = `p_user_id`;
END;

-- FOR QUESTIONS

-- CREATING QUESTIONS TABLE
DROP TABLE IF EXISTS `questions`;
CREATE TABLE `questions` (
    `questionId` VARCHAR(30) NOT NULL,
    `question` VARCHAR(1000) NOT NULL,
    `image`  VARCHAR(100) DEFAULT '',
    `subject` VARCHAR(30) NOT NULL,
    `date` BIGINT(20),
    `lastEdited` BIGINT(20),
    `rewardPoints` INT NOT NULL,
    `askerId` VARCHAR(30) NOT NULL,
    `username` VARCHAR(30) NOT NULL,
    `profilePicture` VARCHAR(110),
    `userBrainliest` VARCHAR(30) DEFAULT NULL,

    PRIMARY KEY (`questionId`)
);

-- INITIAL ENTRIES ON QUESTIONS
INSERT INTO `questions` (
    `questionId`,
    `question`,
    `subject`,
    `rewardPoints`,
    `askerId`,
    `username`,
    `profilePicture`,
    `date`,
    `userBrainliest`
)
VALUES
('1','When did Rizal die?', 'history', 10, '1', 'merck123', '/sample1.jpg', 1626251966085, null),
('2','What is a computer?', 'computer-science', 15, '1', 'merck123', '/sample1.jpg', 1626251966085, '2'),
('3','What is internet?', 'computer-science', 23, '1', 'merck123', '/sample1.jpg',1626251966085, null),
('4','What is a network?', 'computer-science', 12, '2', 'lababa11', '/sample2.jpg',1626251966085, null),
('5','How to sort an array?', 'computer-science', 16, '2', 'lababa11', '/sample2.jpg',1626251966085, null),
('6','Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu.In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. N', 'english', 16, '2', 'lababa11', '/sample2.jpg',1626251969201, null);

-- GETTING ALL QUESTIONS PROCEDURE
DROP PROCEDURE IF EXISTS `get_all_questions`;
CREATE PROCEDURE `get_all_questions` ()
BEGIN
    SELECT 
        `questions`.`questionId`,
        `questions`.`question`,
        `questions`.`askerId`,
        `questions`.`username`,
        `questions`.`subject`,
        `questions`.`date`,
        `questions`.`rewardPoints`,
        GROUP_CONCAT(`answers`.`username`) `answerUsernames`,
        GROUP_CONCAT(`answers`.`profilePicture`) `answerProfilePictures`
    FROM
        `questions`
            LEFT JOIN
        `answers` ON `questions`.`questionId` = `answers`.`questionId`
    GROUP BY `questions`.`questionId`;
END;

-- GETTING QUESTIONS BY SUBJECT PROCEDURE
DROP PROCEDURE IF EXISTS `get_questions_by_subject`;
CREATE PROCEDURE `get_questions_by_subject` (IN `p_subject` VARCHAR(30))
BEGIN
    SELECT * FROM `questions` where `subject` = `p_subject`;
END;

-- GETTING A QUESTION BY QUESTION ID PROCEDURE
DROP PROCEDURE IF EXISTS `get_question_by_question_id`;
CREATE PROCEDURE `get_question_by_question_id` (
    IN `p_questionId` VARCHAR(30)
)
BEGIN
    SELECT
        `questions`.`questionId`,
        `questions`.`question`,
        `questions`.`image`,
        `questions`.`subject`,
        `questions`.`date`,
        `questions`.`lastEdited`,
        `questions`.`rewardPoints`,
        `questions`.`askerId`,
        `questions`.`username`,
        `questions`.`profilePicture`,
        `questions`.`userBrainliest`,
        COUNT(`answers`.`answerId`) AS `answersCtr`
    FROM `questions`
    LEFT JOIN `answers`
    ON `questions`.`questionId` = `answers`.`questionId`
    WHERE `questions`.`questionId` = `p_questionId`
    GROUP BY `questions`.`questionId`;





END;

-- GETTING QUESTIONS BY USER ID
DROP PROCEDURE IF EXISTS `get_questions_by_user_id`;
CREATE PROCEDURE `get_questions_by_user_id` ( IN `p_userId` VARCHAR(30))
BEGIN
    SELECT 
        `t`.`userId`,
        `t`.`questionId`,
        `t`.`question`,
        `t`.`subject`,
        `t`.`date`,
        GROUP_CONCAT(`answers`.`username`) `usernames`,
        GROUP_CONCAT(`answers`.`profilePicture`) `profilePictures`
    FROM
    (
        SELECT 
            `users`.`userId`,
            `questions`.`questionId`,
            `questions`.`question`,
            `questions`.`subject`,
            `questions`.`date`
        FROM
            `users`
                INNER JOIN
            `questions` ON `users`.`userId` = `questions`.`askerId`
        WHERE `users`.`userId` = `p_userId`) AS `t`
    INNER JOIN `answers`
    ON `t`.`questionId` = `answers`.`questionId`
    GROUP BY `t`.`questionId`;
END;

-- ADDING A QUESTION PROCEDURE
DROP PROCEDURE IF EXISTS `add_question`;
CREATE PROCEDURE `add_question` (
    IN `p_questionId` VARCHAR(30),
    IN `p_question` VARCHAR(1000),
    IN `p_subject` VARCHAR(30),
    IN `p_image` VARCHAR(110),
    IN `p_rewardPoints` INT,
    IN `p_askerId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(110),
    IN `p_date` BIGINT(20)
    
)
BEGIN
    INSERT INTO `questions` (`questionId`, `question`, `subject`, `image`, `rewardPoints`, `askerId`, `username`, `profilePicture`, `date`)
    VALUES (`p_questionId`, `p_question`, `p_subject`, `p_image`, `p_rewardPoints`, `p_askerId`, `p_username`, `p_profilePicture`, `p_date`);
    SELECT * FROM `questions` WHERE `questionId` = `p_questionId`;
END;

-- EDITING A QUESTION PROCEDURE
DROP PROCEDURE IF EXISTS `edit_question`;
CREATE PROCEDURE `edit_question` (
    IN `p_questionId` VARCHAR(30),
    IN `p_newQuestion` VARCHAR(1000),
    IN `p_lastEdited` BIGINT(20)
)
BEGIN
    UPDATE `questions` SET `question` = `p_newQuestion`, `lastEdited` = `p_lastEdited` WHERE `questionId` = `p_questionId`;
    SELECT * FROM `questions` WHERE `questionId` = `p_questionId`;
END;

-- DELETING A QUESTION PROCEDURE
DROP PROCEDURE IF EXISTS `delete_question`;
CREATE PROCEDURE `delete_question` (
    IN `p_questionId` VARCHAR(30)
)
BEGIN
    DELETE FROM `questions` WHERE `questionId` = `p_questionId`;
END;

-- UPDATING QUESTION USER BRAINLIEST PROCEDURE
DROP PROCEDURE IF EXISTS `update_question_user_brainliest`;
CREATE PROCEDURE `update_question_user_brainliest` (
    IN `p_questionId` VARCHAR(30),
    IN `p_userId` VARCHAR(30)
)
BEGIN
    UPDATE `questions` SET `userBrainliest` = `p_userId` WHERE `questionId` = `p_questionId`;
END;

-- UPDATING USER INFO ON QUESTIONS PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_questions`;
CREATE PROCEDURE `update_user_questions` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(110)
)
BEGIN
    UPDATE `questions` SET `username` = `p_username`, `profilePicture` = `p_profilePicture` WHERE `askerId` = `p_userId`;
END;

-- FOR ANSWERS

-- CREATING ANSWERS TABLE
DROP TABLE IF EXISTS `answers`;
CREATE TABLE `answers` (
    `answerId` VARCHAR(30) NOT NULL,
    `answer` VARCHAR(110) NOT NULL,
    `questionId` VARCHAR(30) NOT NULL,
    `question` VARCHAR(1000) NOT NULL,
    `subject` VARCHAR(30) NOT NULL,
    `userId`  VARCHAR(30) NOT NULL,
    `username` VARCHAR(16) NOT NULL,
    `profilePicture` VARCHAR(110) DEFAULT '',
    `date` BIGINT(20) NOT NULL,
    `lastEdited` BIGINT(20),
    `isBrainliest` BOOLEAN DEFAULT false,
    `isAnswer` BOOLEAN DEFAULT true,
    

    PRIMARY KEY (`answerId`)
);

-- INITIAL ENTRIES FOR ANSWERS
INSERT INTO `answers` (
    `answerId`,
    `answer`,
    `questionId`,
    `question`,
    `subject`,
    `userId`,
    `userName`,
    `profilePicture`,
    `isBrainliest`,
    `date`
)
VALUES
('1','I have a dream.', '1', 'When did Rizal die?', 'history','2', 'lababa11','/sample2.jpg', 0, 1626251966120),
('2','Another answer', '1', 'When did Rizal die?','history','3', 'lyzer0101', '/sample3.jpg',0, 1626251966120),
('3','Answer again.', '1', 'When did Rizal die?', 'history','4', 'nani0101', '/sample4.jpg',0, 1626251966120),
('4','Brainliest answer.', '2', 'What is a computer?', 'computer-science', '2', 'lababa11','/sample2.jpg', 1, 1626251966120),
('5','Answer to the question.', '3', 'What is internet??', 'computer-science', '2', 'lababa11', '/sample2.jpg',1, 1626251966120);

-- GETING AN ANSWER BY QUESTION ID

DROP PROCEDURE IF EXISTS `get_answer_by_answer_id`;
CREATE PROCEDURE `get_answer_by_answer_id` ( IN `p_answerId` VARCHAR(30))
BEGIN
    SELECT * FROM `answers` WHERE `answerId` = `p_answerId`;
END;

-- GETTING ANSWERS BY QUESTION ID
DROP PROCEDURE IF EXISTS `get_answers_by_question_id`;
CREATE PROCEDURE `get_answers_by_question_id` ( IN `p_questionId` VARCHAR(30))
BEGIN
    SELECT 
        `answers`.`answerId`,
        `answers`.`answer`,
        `answers`.`questionId`,
        `answers`.`question`,
        `answers`.`subject`,
        `answers`.`userId`,
        `answers`.`username`,
        `answers`.`profilePicture`,
        `answers`.`date`,
        `answers`.`isBrainliest`,
        GROUP_CONCAT(`thanks`.`thankerUsername`) `thankerUsernames`,
        GROUP_CONCAT(`thanks`.`thankerProfilePicture`) `thankerProfilePictures`
    FROM `answers`
    LEFT JOIN `thanks`
    ON `answers`.`answerId` = `thanks`.`answerId`
    WHERE `answers`.`questionId` = `p_questionId`
    GROUP BY `answers`.`answerId`;
END;

-- GETTING ANSWERS BY USER ID
DROP PROCEDURE IF EXISTS `get_answers_by_user_id`;
CREATE PROCEDURE `get_answers_by_user_id` ( IN `p_userId` VARCHAR(30))
BEGIN
    SELECT * FROM `answers` WHERE `userId` = `p_userId`;
END;

-- GETTING ANSWER BY QUESTION ID AND USER ID (used to check if user already answered this question)
DROP PROCEDURE IF EXISTS `get_answer_by_question_id_and_user_id`;
CREATE PROCEDURE `get_answer_by_question_id_and_user_id` ( 
    IN `p_questionId` VARCHAR(30),
    IN `p_userId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `answers` WHERE `userId` = `p_userId` AND `questionId` = `p_questionId`;
END;

-- ADDING AN ANSWER PROCEDURE
DROP PROCEDURE IF EXISTS `add_answer`;
CREATE PROCEDURE `add_answer` (
    IN `p_answerId` VARCHAR(30),
    IN `p_answer` VARCHAR(110),
    IN `p_questionId` VARCHAR(30),
    IN `p_question` VARCHAR(1000),
    IN `p_subject` VARCHAR(30),
    IN `p_userId` VARCHAR(30),
    IN `p_userName` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(110),
    IN `p_date` BIGINT(20)
)
BEGIN
    INSERT INTO `answers` (`answerId`,`answer`,`questionId`,`question`, `subject`,`userId`,`userName`, `profilePicture`, `date`)
    VALUES (`p_answerId`,`p_answer`,`p_questionId`,`p_question`, `p_subject`,`p_userId`,`p_userName`, `p_profilePicture`, `p_date`);
    SELECT * FROM `answers` WHERE `answerId` = `p_answerId`;
END;

-- EDITING AN ANSWER PROCEDURE
DROP PROCEDURE IF EXISTS `edit_answer`;
CREATE PROCEDURE `edit_answer` (
    IN `p_answerId` VARCHAR(30),
    IN `p_answer` VARCHAR(110),
    IN `p_lastEdited` BIGINT(20)
)
BEGIN
    UPDATE `answers` SET `answer` = `p_answer`, `lastEdited` = `p_lastEdited` WHERE `answerId` = `p_answerId`;
    SELECT * FROM `answers` WHERE `answerId` = `p_answerId`;
END;

-- DELETE AN ANSWER BY ANSWER ID PROCEDURE
DROP PROCEDURE IF EXISTS `delete_answer`;
CREATE PROCEDURE `delete_answer` (
    IN `p_answerId` VARCHAR(30)
)
BEGIN
    DELETE FROM `answers` WHERE `answerId` = `p_answerId`;
END;

-- DELETE AN ANSWER BY ANSWER ID PROCEDURE
DROP PROCEDURE IF EXISTS `delete_answers_by_question_id`;
CREATE PROCEDURE `delete_answers_by_question_id` (
    IN `p_questionId` VARCHAR(30)
)
BEGIN
    DELETE FROM `answers` WHERE `questionId` = `p_questionId`;
END;

-- UPDATING ANSWER ISBRAINLIEST PROCEDURE
DROP PROCEDURE IF EXISTS `update_answer_brainliest`;
CREATE PROCEDURE `update_answer_brainliest` (
    IN `p_answerId` VARCHAR(30)
)
BEGIN
    UPDATE `answers` SET `isBrainliest` = true WHERE `answerId` = `p_answerId`;
END;

-- UPDATING USER INFO ON ANSWERS PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_answers`;
CREATE PROCEDURE `update_user_answers` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(110)
)
BEGIN
    UPDATE `answers` SET `username` = `p_username`, `profilePicture` = `p_profilePicture` WHERE `userId` = `p_userId`;
END;

-- FOR COMMENTS

-- CREATE COMMENTS TABLE
DROP TABLE IF EXISTS `comments`;
CREATE TABLE `comments` (
    `commentId` VARCHAR(30) NOT NULL,
    `comment` VARCHAR(110) NOT NULL,
    `userId` VARCHAR(30) NOT NULL,
    `username` VARCHAR(16) NOT NULL,
    `profilePicture` VARCHAR(110),
    `questionId`  VARCHAR(30) NOT NULL,
    `answerId` VARCHAR(30),
    `parent` ENUM('question', 'answer') NOT NULL,
    `date` BIGINT(20) NOT NULL,
    `lastEdited` BIGINT(20),

    PRIMARY KEY (`commentId`)
);

-- INITIAL ENTRIES OF COMMENTS TABLE

INSERT INTO `comments` (
    `commentId`,
    `comment`,
    `userId`,
    `username`,
    `profilePicture`,
    `questionId`,
    `answerId`,
    `parent`,
    `date`
)
VALUES 
('1', 'Can you elaborate?', '2', 'lababa11', '/sample2.jpg','1', null, 'question', 1626251966085),
('2', 'I dont understand the question.', '1', 'merck123', '/sample1.jpg', '1', null, 'question', 1626251966099),
('3', 'Nice answer!', '1', 'merck123', '/sample1.jpg','1', '1', 'answer', 1626251966120),
('4', 'Nice answer!', '1', 'merck123','/sample1.jpg', '1', '1', 'answer', 1626251966320),
('5', 'Nice answer!', '1', 'merck123','/sample1.jpg', '1', '1', 'answer', 1626251966620);

-- GETTING A SINGLE COMMENT PROCEDURE
DROP PROCEDURE IF EXISTS `get_comment_by_comment_id`;
CREATE PROCEDURE `get_comment_by_comment_id` (
    IN `p_commentId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `comments` WHERE `commentId` = `p_commentId`;
END;

-- GETTING ALL COMMENTS BY QUESTION ID PROCEDURE
DROP PROCEDURE IF EXISTS `get_comments_by_question_id`;
CREATE PROCEDURE `get_comments_by_question_id` (
    IN `p_questionId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `comments` WHERE `questionId` = `p_questionId` AND `parent` = "question";
END;

-- GETTING COMMENTS BY ANSWER ID PROCEDURE
DROP PROCEDURE IF EXISTS `get_comments_by_answer_id`;
CREATE PROCEDURE `get_comments_by_answer_id` (
    IN `p_answerId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `comments` WHERE `answerId` = `p_answerId` AND `parent` = "answer";
END;

-- ADDING A SINGLE COMMENT PROCEDURE
DROP PROCEDURE IF EXISTS `add_comment`;
CREATE PROCEDURE `add_comment` (
    IN `p_commentId` VARCHAR(30),
    IN `p_comment` VARCHAR(110),
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(110),
    IN `p_questionId` VARCHAR(30),
    IN `p_answerId` VARCHAR(30),
    IN `p_parent` ENUM('question', 'answer'),
    IN `p_date` BIGINT(20)
)
BEGIN
    INSERT INTO `comments` (`commentId`, `comment`, `userId`, `username`, `profilePicture`, `questionId`, `answerId`, `parent`, `date`) 
    VALUES (`p_commentId`, `p_comment`, `p_userId`, `p_username`, `p_profilePicture`,  `p_questionId`, `p_answerId`, `p_parent`, `p_date`);
END;

-- EDITING A QUESTION PROCEDURE
DROP PROCEDURE IF EXISTS `edit_comment`;
CREATE PROCEDURE `edit_comment` (
    IN `p_commentId` VARCHAR(30),
    IN `p_newComment` VARCHAR(110),
    IN `p_lastEdited` BIGINT(20)
)
BEGIN
    UPDATE `comments` SET `comment` = `p_newComment`, `lastEdited` = `p_lastEdited` WHERE `commentId` = `p_commentId`;
    SELECT * FROM `comments` WHERE `commentId` = `p_commentId`;
END;

-- DELETING A COMMENT BY COMMENT ID PROCEDURE
DROP PROCEDURE IF EXISTS `delete_comment_by_comment_id`;
CREATE PROCEDURE `delete_comment_by_comment_id` (
    IN `p_commentId` VARCHAR(30)
)
BEGIN
    DELETE FROM `comments` WHERE `commentId` = `p_commentId`;
END;

-- DELETING COMMENTS BY QUESTION ID PROCEDURE
DROP PROCEDURE IF EXISTS `delete_comments_by_question_id`;
CREATE PROCEDURE `delete_comments_by_question_id` (
    IN `p_questionId` VARCHAR(30)
)
BEGIN
    DELETE FROM `comments` WHERE `questionId` = `p_questionId`;
END;

-- DELETING COMMENTS BY ANSWER ID PROCEDURE
DROP PROCEDURE IF EXISTS `delete_comments_by_answer_id`;
CREATE PROCEDURE `delete_comments_by_answer_id` (
    IN `p_answerId` VARCHAR(30)
)
BEGIN
    DELETE FROM `comments` WHERE `answerId` = `p_answerId`;
END;

-- UPDATING USER INFO ON COMMENTS PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_comments`;
CREATE PROCEDURE `update_user_comments` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(110)
)
BEGIN
    UPDATE `comments` SET `username` = `p_username`, `profilePicture` = `p_profilePicture` WHERE `userId` = `p_userId`;
END;


-- FOR THANKS
DROP TABLE IF EXISTS `thanks`;
CREATE TABLE `thanks` (
    `thankId` VARCHAR(30) NOT NULL,
    `thankerId` VARCHAR(30) NOT NULL,
    `thankerUsername` VARCHAR(16) NOT NULL,
    `thankerProfilePicture` VARCHAR(110),
    `questionId` VARCHAR(30) NOT NULL,
    `answerId` VARCHAR(30) NOT NULL,
    `answerUserId` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`thankId`)
);

-- INITIAL ENTRIES OF THANKS TABLE

INSERT INTO `thanks` (
    `thankId`,
    `thankerId`,
    `thankerUsername`,
    `thankerProfilePicture`,
    `questionId`,
    `answerId`,
    `answerUserId`
)
VALUES 
('1', '1', 'merck123', '/sample1.jpg', '1', '1', '2'),
('2', '4', 'nani0101', '/sample4.jpg', '1', '1', '2'),
('3', '3', 'lyzer0101', '/sample3.jpg', '1', '1', '2');

-- GETTING A THANK RECORD FOR CHECKING IF USER ALREADY THANKED THE SAME ANSWER PROCEDURE
DROP PROCEDURE IF EXISTS `get_thank_by_thanker_id_and_answer_user_id`;
CREATE PROCEDURE `get_thank_by_thanker_id_and_answer_user_id` (
    IN `p_thankerId` VARCHAR(30),
    IN `p_answerId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `thanks` WHERE `thankerId` = `p_thankerId` AND `answerId` = `p_answerId`;
END;

-- ADDS A THANK RECORD
DROP PROCEDURE IF EXISTS `add_thank`;
CREATE PROCEDURE `add_thank` (
    IN `p_thankId` VARCHAR(30),
    IN `p_thankerId` VARCHAR(30),
    IN `p_thankerUsername` VARCHAR(30),
    IN `p_thankerProfilePicture` VARCHAR(110),
    IN `p_questionId` VARCHAR(30),
    IN `p_answerId` VARCHAR(30),
    IN `p_answerUserId` VARCHAR(30)
)
BEGIN
    INSERT INTO `thanks` (`thankId`,`thankerId`,`thankerUsername`,`thankerProfilePicture`,`questionId`,`answerId`,`answerUserId`)
    VALUES (`p_thankId`,`p_thankerId`,`p_thankerUsername`,`p_thankerProfilePicture`,`p_questionId`,`p_answerId`,`p_answerUserId`);
END;

-- DELETING THANKS BY QUESTION ID PROCEDURE
DROP PROCEDURE IF EXISTS `delete_thanks_by_question_id`;
CREATE PROCEDURE `delete_thanks_by_question_id` (
    IN `p_questionId` VARCHAR(30)

)
BEGIN
    DELETE FROM `thanks` WHERE `questionId` = `p_questionId`;
END;

-- UPDATING USER INFO ON COMMENTS PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_thanks`;
CREATE PROCEDURE `update_user_thanks` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(110)
)
BEGIN
    UPDATE `thanks` SET `thankerUsername` = `p_username`, `thankerProfilePicture` = `p_profilePicture` WHERE `thankerId` = `p_userId`;
END;
