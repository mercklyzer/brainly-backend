-- FOR USERS

-- CREATING TABLE
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
    `userId` VARCHAR(30) NOT NULL,
    `username` VARCHAR(16) NOT NULL,
    `email`  VARCHAR(64) NOT NULL,
    `profilePicture` VARCHAR(500) DEFAULT '',
    `password` VARCHAR(110) NOT NULL,
    `currentPoints` INT DEFAULT 90,
    `birthday` VARCHAR(10),

    PRIMARY KEY (`userId`)
);

CREATE INDEX idx_email ON `users` (`email`); 
CREATE INDEX idx_username ON `users` (`username`); 

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
    IN `p_profilePicture` VARCHAR(500),
    IN `p_currentPoints` INT,
    IN `p_birthday` VARCHAR(10)
)
BEGIN
    INSERT INTO `users` (`userId`, `username`, `password`, `email`, `profilePicture`, `currentPoints`, `birthday`) 
    VALUES (`p_userId`, `p_username`, `p_password`, `p_email`, `p_profilePicture`, `p_currentPoints`, `p_birthday`);
END;

-- EDITING A USER PROCEDURE
DROP PROCEDURE IF EXISTS `edit_user`;
CREATE PROCEDURE `edit_user` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_email`  VARCHAR(64),
    IN `p_password` VARCHAR(110),
    IN `p_level` ENUM('Junior High', 'Senior High', 'College'),
    IN `p_profilePicture` VARCHAR(500)
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
    IN `p_user_id` VARCHAR(110)
)
BEGIN
	DECLARE answersCtr INT DEFAULT 0;
    DECLARE brainliestCtr INT DEFAULT 0;
    DECLARE thanksCtr INT DEFAULT 0;
    
    SELECT COALESCE(sum(answers.isBrainliest), 0) , COALESCE(COUNT(*), 0) INTO brainliestCtr, answersCtr
	FROM `answers`
	WHERE `userId` = `p_user_id`;

	SELECT COALESCE(COUNT(*),0) INTO `thanksCtr` FROM `thanks` WHERE `thanks`.`answerUserId` = `p_user_id`;
    
	SELECT  
		`users`.`userId`,
		`users`.`username`,
		`users`.`email`,
		`users`.`password`,
		`users`.`profilePicture`,
		`users`.`birthday`,
		`users`.`level`,
		brainliestCtr,
		answersCtr,
        thanksCtr,
		`users`.`currentPoints`

		FROM `users`
        WHERE `users`.`userId` = `p_user_id`;
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
    `subject` VARCHAR(30) NOT NULL,
    `date` BIGINT(20),
    `lastEdited` BIGINT(20),
    `rewardPoints` INT NOT NULL,
    `askerId` VARCHAR(30) NOT NULL,
    `username` VARCHAR(30) NOT NULL,
    `profilePicture` VARCHAR(500),
    `hasBrainliest` BOOLEAN DEFAULT false,

    PRIMARY KEY (`questionId`)
);

CREATE INDEX idx_date ON `questions` (`date`);
CREATE INDEX idx_subject_date ON `questions` (`subject`, `date`);
CREATE INDEX idx_askerId_date ON `questions` (`askerId`, `date`);

-- GETTING ALL QUESTIONS PROCEDURE
DROP PROCEDURE IF EXISTS `get_all_questions`;
CREATE PROCEDURE `get_all_questions` (
    IN `p_offset` INT
)
BEGIN
    SELECT 
        `questions`.`questionId`,
        `questions`.`question`,
        `questions`.`askerId`,
        `questions`.`username`,
        `questions`.`profilePicture`,
        `questions`.`subject`,
        `questions`.`date`,
        `questions`.`rewardPoints`
    FROM
        `questions`
    ORDER BY `date` DESC
    LIMIT 5
    OFFSET `p_offset`;
END;

-- GETTING QUESTIONS BY SUBJECT PROCEDURE
DROP PROCEDURE IF EXISTS `get_questions_by_subject`;
CREATE PROCEDURE `get_questions_by_subject` (IN `p_subject` VARCHAR(30), IN `p_offset` INT)
BEGIN
    SELECT * FROM `questions` where `subject` = `p_subject`
    ORDER BY `date` DESC
    LIMIT 5
    OFFSET `p_offset`;
END;

-- GETTING A QUESTION BY QUESTION ID PROCEDURE
DROP PROCEDURE IF EXISTS `get_question_by_question_id`;
CREATE PROCEDURE `get_question_by_question_id` (
    IN `p_questionId` VARCHAR(30)
)
BEGIN
	DECLARE answersCtr INT DEFAULT 0;
	
	SELECT COUNT(*) INTO answersCtr
    FROM `answers`
    WHERE `answers`.`questionId` = `p_questionId`;
    
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
        answersCtr,
        `questions`.`hasBrainliest`
        FROM `questions`
    WHERE `questions`.`questionId` = `p_questionId`;
END;

-- GETTING QUESTIONS BY USER ID
DROP PROCEDURE IF EXISTS `get_questions_by_user_id`;
CREATE PROCEDURE `get_questions_by_user_id` ( IN `p_userId` VARCHAR(30), IN `p_offset` INT)
BEGIN
	SELECT 
		`questions`.`askerId`,
        `questions`.`username`,
        `questions`.`profilePicture`,
		`questions`.`questionId`,
		`questions`.`question`,
		`questions`.`subject`,
		`questions`.`date`,
        (SELECT COUNT(*) AS answersCtr FROM answers WHERE answers.questionId = questions.questionId) AS answersCtr
	FROM
		`questions`
	WHERE `questions`.`askerId` = `p_userId`
    ORDER BY questions.date DESC
    LIMIT 5 OFFSET `p_offset`;
END;

-- ADDING A QUESTION PROCEDURE
DROP PROCEDURE IF EXISTS `add_question`;
CREATE PROCEDURE `add_question` (
    IN `p_questionId` VARCHAR(30),
    IN `p_question` VARCHAR(1000),
    IN `p_subject` VARCHAR(30),
    IN `p_rewardPoints` INT,
    IN `p_askerId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(500),
    IN `p_date` BIGINT(20)
    
)
BEGIN
    INSERT INTO `questions` (`questionId`, `question`, `subject`, `rewardPoints`, `askerId`, `username`, `profilePicture`, `date`)
    VALUES (`p_questionId`, `p_question`, `p_subject`,  `p_rewardPoints`, `p_askerId`, `p_username`, `p_profilePicture`, `p_date`);
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
    IN `p_questionId` VARCHAR(30)
)
BEGIN
    UPDATE `questions` SET `hasBrainliest` = 1 WHERE `questionId` = `p_questionId`;
END;

-- UPDATING USER INFO ON QUESTIONS PROCEDURE
DROP PROCEDURE IF EXISTS `update_user_questions`;
CREATE PROCEDURE `update_user_questions` (
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(500)
)
BEGIN
    UPDATE `questions` SET `username` = `p_username`, `profilePicture` = `p_profilePicture` WHERE `askerId` = `p_userId`;
END;

-- FOR ANSWERS

-- CREATING ANSWERS TABLE
DROP TABLE IF EXISTS `answers`;
CREATE TABLE `answers` (
    `answerId` VARCHAR(30) NOT NULL,
    `answer` VARCHAR(1000) NOT NULL,
    `questionId` VARCHAR(30) NOT NULL,
    `question` VARCHAR(1000) NOT NULL,
    `subject` VARCHAR(30) NOT NULL,
    `userId`  VARCHAR(30) NOT NULL,
    `username` VARCHAR(16) NOT NULL,
    `profilePicture` VARCHAR(500) DEFAULT '',
    `date` BIGINT(20) NOT NULL,
    `isBrainliest` BOOLEAN DEFAULT false,
    `thanksCtr` INT DEFAULT 0,

    PRIMARY KEY (`answerId`)
);

CREATE INDEX idx_questionId_isBrainliest_thanksCtr_date ON `answers` (`questionId`, `isBrainliest`,`thanksCtr`,`date`);
CREATE INDEX idx_userId_date ON `answers` (`userId`, `date`);

-- GETING AN ANSWER BY QUESTION ID

DROP PROCEDURE IF EXISTS `get_answer_by_answer_id`;
CREATE PROCEDURE `get_answer_by_answer_id` ( IN `p_answerId` VARCHAR(30))
BEGIN
    SELECT * FROM `answers` WHERE `answerId` = `p_answerId`;
END;

-- GETTING ANSWERS BY QUESTION ID
DROP PROCEDURE IF EXISTS `get_answers_by_question_id`;
CREATE PROCEDURE `get_answers_by_question_id` ( IN `p_questionId` VARCHAR(30), IN `p_userId` VARCHAR(30), IN `p_offset` INT)
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
        `answers`.`thanksCtr`,
        CASE WHEN EXISTS(
			SELECT * FROM thanks WHERE thankerId = p_userId AND thanks.answerId = answers.answerId LIMIT 1
        ) THEN 1 ELSE 0 END AS isUserThanked
    FROM `answers`
    WHERE `answers`.`questionId` = `p_questionId`
    ORDER BY `answers`.`isBrainliest` DESC, `thanksCtr` DESC, `date` DESC
    LIMIT 5 OFFSET `p_offset`;
END;

-- GETTING ANSWERS BY USER ID
DROP PROCEDURE IF EXISTS `get_answers_by_user_id`;
CREATE PROCEDURE `get_answers_by_user_id` ( IN `p_userId` VARCHAR(30), IN `p_offset` INT)
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
        `answers`.`thanksCtr`
    FROM `answers`
    WHERE `answers`.`userId` = `p_userId`
    ORDER BY `date` DESC
    LIMIT 5 OFFSET `p_offset`;
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
    IN `p_answer` VARCHAR(1000),
    IN `p_questionId` VARCHAR(30),
    IN `p_question` VARCHAR(1000),
    IN `p_subject` VARCHAR(30),
    IN `p_userId` VARCHAR(30),
    IN `p_userName` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(500),
    IN `p_date` BIGINT(20)
)
BEGIN
    INSERT INTO `answers` (`answerId`,`answer`,`questionId`,`question`, `subject`,`userId`,`userName`, `profilePicture`, `date`)
    VALUES (`p_answerId`,`p_answer`,`p_questionId`,`p_question`, `p_subject`,`p_userId`,`p_userName`, `p_profilePicture`, `p_date`);
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

-- INCREMENETING ANSWER'S THANKSCTR PROCEDURE
DROP PROCEDURE IF EXISTS `increment_answer_thanksCtr`;
CREATE PROCEDURE `increment_answer_thanksCtr` (
    IN `p_answerId` VARCHAR(30)
)
BEGIN
    UPDATE `answers` SET thanksCtr = thanksCtr+1 WHERE `answerId` = `p_answerId`;
END;

-- UPDATING THE QUESTION IN ANSWERS TABLE PROCEDU RE
DROP PROCEDURE IF EXISTS `update_answers_question`;
CREATE PROCEDURE `update_answers_question` (
    IN `p_questionId` VARCHAR(30),
    IN `p_question` VARCHAR(1000)
)
BEGIN
    UPDATE `answers` SET `question` = `p_question` WHERE `questionId` = `p_questionId`;
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
    IN `p_profilePicture` VARCHAR(500)
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
    `profilePicture` VARCHAR(500),
    `questionId`  VARCHAR(30) NOT NULL,
    `answerId` VARCHAR(30),
    `parent` ENUM('question', 'answer') NOT NULL,
    `date` BIGINT(20) NOT NULL,
    `lastEdited` BIGINT(20),

    PRIMARY KEY (`commentId`)
);

CREATE INDEX idx_questionId_parent_date ON `comments` (`questionId`, `parent`,`date`);
CREATE INDEX idx_answerId_parent_date ON `comments` (`answerId`, `parent`,`date`);
CREATE INDEX idx_userId ON `comments` (`userId`);

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
    IN `p_questionId` VARCHAR(30),
    IN `p_offset` INT
)
BEGIN
    SELECT * FROM `comments` WHERE `questionId` = `p_questionId` AND `parent` = "question"
    ORDER BY `date` ASC
    LIMIT 5 OFFSET `p_offset`;
END;

-- GETTING COMMENTS BY ANSWER ID PROCEDURE
DROP PROCEDURE IF EXISTS `get_comments_by_answer_id`;
CREATE PROCEDURE `get_comments_by_answer_id` (
    IN `p_answerId` VARCHAR(30),
    IN `p_offset` INT
)
BEGIN
    SELECT * FROM `comments` WHERE `answerId` = `p_answerId` AND `parent` = "answer"
    ORDER BY `date` ASC
    LIMIT 5 OFFSET `p_offset`;
END;

-- ADDING A SINGLE COMMENT PROCEDURE
DROP PROCEDURE IF EXISTS `add_comment`;
CREATE PROCEDURE `add_comment` (
    IN `p_commentId` VARCHAR(30),
    IN `p_comment` VARCHAR(110),
    IN `p_userId` VARCHAR(30),
    IN `p_username` VARCHAR(16),
    IN `p_profilePicture` VARCHAR(500),
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
    IN `p_profilePicture` VARCHAR(500)
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
    `thankerProfilePicture` VARCHAR(500),
    `questionId` VARCHAR(30) NOT NULL,
    `answerId` VARCHAR(30) NOT NULL,
    `answerUserId` VARCHAR(30) NOT NULL,

    PRIMARY KEY (`thankId`)
);

CREATE INDEX idx_thankerId_answerId ON `thanks` (`thankerId`, `answerId`);
CREATE INDEX idx_answerId ON `thanks` (`answerId`);

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
    IN `p_thankerProfilePicture` VARCHAR(500),
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
    IN `p_profilePicture` VARCHAR(500)
)
BEGIN
    UPDATE `thanks` SET `thankerUsername` = `p_username`, `thankerProfilePicture` = `p_profilePicture` WHERE `thankerId` = `p_userId`;
END;


-- FOR MESSAGING

DROP TABLE IF EXISTS `threads`;
CREATE TABLE `threads` (
    `threadId` VARCHAR(30) NOT NULL,
    `user1Id` VARCHAR(30) NOT NULL,
    `user1Username` VARCHAR(16) NOT NULL,
    `user1ProfilePicture` VARCHAR(500) DEFAULT '',
    `user2Id` VARCHAR(30) NOT NULL,
    `user2Username` VARCHAR(16) NOT NULL,
    `user2ProfilePicture` VARCHAR(500) DEFAULT '',
    `lastSender` VARCHAR(30) DEFAULT '',
    `lastMessage` VARCHAR(1000) DEFAULT '',
    `lastMessageDate` BIGINT(20) NOT NULL,

    PRIMARY KEY(`threadId`)
);

DROP PROCEDURE IF EXISTS `get_thread_by_thread_id`;
CREATE PROCEDURE `get_thread_by_thread_id` (
    IN `p_threadId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `threads` WHERE `threadId` = `p_threadId`;
END;

DROP PROCEDURE IF EXISTS `get_thread_by_user_ids`;
CREATE PROCEDURE `get_thread_by_user_ids` (
    IN `p_user1Id` VARCHAR(30),
    IN `p_user2Id` VARCHAR(30)
)
BEGIN
    SELECT `threadId` FROM `threads` WHERE `user1Id` = `p_user1Id` AND `user2Id` = `p_user2Id`;
END;


DROP PROCEDURE IF EXISTS `add_thread`;
CREATE PROCEDURE `add_thread` (
    IN `p_threadId` VARCHAR(30), 
    IN `p_user1Id` VARCHAR(30), 
    IN `p_user1Username` VARCHAR(16), 
    IN `p_user1ProfilePicture` VARCHAR(500), 
    IN `p_user2Id` VARCHAR(30), 
    IN `p_user2Username` VARCHAR(16), 
    IN `p_user2ProfilePicture` VARCHAR(500), 
    IN `p_lastSender` VARCHAR(30), 
    IN `p_lastMessage` VARCHAR(1000), 
    IN `p_date` BIGINT(20)
)
BEGIN
    INSERT INTO `threads` (`threadId`, `user1Id`, `user1Username`, `user1ProfilePicture`, `user2Id`, `user2Username`, `user2ProfilePicture`, `lastSender`, `lastMessage`, `lastMessageDate`)
    VALUES (`p_threadId`, `p_user1Id`, `p_user1Username`, `p_user1ProfilePicture`, `p_user2Id`, `p_user2Username`, `p_user2ProfilePicture`, `p_lastSender`, `p_lastMessage`, `p_date`);
END;

DROP PROCEDURE IF EXISTS `get_threads_by_user_id`;
CREATE PROCEDURE `get_threads_by_user_id` (
    IN `p_userId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `threads` 
    WHERE (`user1Id` = `p_userId` OR `user2Id` = `p_userId`) AND `lastMessage` != ''
    ORDER BY `lastMessageDate` DESC; 
END;

DROP PROCEDURE IF EXISTS `update_thread`;
CREATE PROCEDURE `update_thread` (
    IN `p_threadId` VARCHAR(30),
    IN `p_message` VARCHAR(1000),
    IN `p_date` BIGINT
)
BEGIN
    UPDATE `threads` SET `lastMessage` = `p_message`, `lastMessageDate` = `p_date`
    WHERE `threadId` = `p_threadId`;
    SELECT * FROM `threads` WHERE `threadId` = `p_threadId`; 
END;




DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
    `messageId` VARCHAR(30) NOT NULL,
    `threadId` VARCHAR(30) NOT NULL,
    `message` VARCHAR(1000) NOT NULL,
    `senderId` VARCHAR(30) NOT NULL,
    `senderUsername` VARCHAR(16) NOT NULL,
    `senderProfilePicture` VARCHAR(500) DEFAULT '',
    `receiverId` VARCHAR(30) NOT NULL,
    `receiverUsername` VARCHAR(16) NOT NULL,
    `receiverProfilePicture` VARCHAR(500) DEFAULT '',
    `date` BIGINT(20) NOT NULL,

    PRIMARY KEY(`messageId`)
);


DROP PROCEDURE IF EXISTS `get_messages_by_thread_id`;
CREATE PROCEDURE `get_messages_by_thread_id` (
    IN `p_threadId` VARCHAR(30)
)
BEGIN
    SELECT * FROM `messages` 
    WHERE `threadId` = `p_threadId`
    ORDER BY `date` DESC; 
END;

DROP PROCEDURE IF EXISTS `add_message`;
CREATE PROCEDURE `add_message` (
    IN `p_messageId` VARCHAR(30), 
    IN `p_threadId` VARCHAR(30), 
    IN `p_senderId` VARCHAR(30), 
    IN `p_senderUsername` VARCHAR(16), 
    IN `p_senderProfilePicture` VARCHAR(500), 
    IN `p_receiverId` VARCHAR(30), 
    IN `p_receiverUsername` VARCHAR(16), 
    IN `p_receiverProfilePicture` VARCHAR(500), 
    IN `p_message` VARCHAR(1000), 
    IN `p_date` BIGINT(20)
)
BEGIN
    INSERT INTO `messages` (`messageId`, `threadId`, `senderId`, `senderUsername`, `senderProfilePicture`, `receiverId`, `receiverUsername`, `receiverProfilePicture`, `message`, `date`)
    VALUES (`p_messageId`, `p_threadId`, `p_senderId`, `p_senderUsername`, `p_senderProfilePicture`, `p_receiverId`, `p_receiverUsername`, `p_receiverProfilePicture`, `p_message`, `p_date`);
END;