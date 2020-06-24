const express = require("express");
const LanguageService = require("./language-service");
const { requireAuth } = require("../middleware/jwt-auth");
const parser = express.json();
const { _Node, makeArray } = require("../linkedlist/linkedlist");

const languageRouter = express.Router();

languageRouter.use(requireAuth).use(async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get("db"),
      req.user.id
    );

    if (!language)
      return res.status(404).json({
        error: `You don't have any languages`,
      });

    req.language = language;
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get("/", async (req, res, next) => {
  try {
    const words = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );

    res.json({
      language: req.language,
      words,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.get("/head", async (req, res, next) => {
  try {
    const [nextWord] = await LanguageService.getLanguageWords(
      req.app.get("db"),
      req.language.id
    );
    res.json({
      nextWord: nextWord.original,
      totalScore: req.language.total_score,
      wordCorrectCount: nextWord.correct_count,
      wordIncorrectCount: nextWord.incorrect_count,
    });
    next();
  } catch (error) {
    next(error);
  }
});

languageRouter.post("/guess", parser, async (req, res, next) => {
  const db = req.app.get("db");
  const language = req.language.id;
  const guess = req.body.guess;
  let total_score = req.language.total_score;

  if (!guess) {
    res.status(400).json({ error: "Missing 'guess' in request body" });
  }

  try {
    //request user words
    const words = await LanguageService.getLanguageWords(db, language);
    //find the head
    const [{ head }] = await LanguageService.getHead(db, language);
    const list = LanguageService.generateLinkedList(words, head);
    const [checkGuess] = await LanguageService.checkGuess(db, language);

    if (checkGuess.translation === guess) {
      //if guess is correct, double the memory value and add a correct counter value
      const mv = list.head.value.memory_value * 2;
      list.head.value.memory_value = mv;
      list.head.value.correct_count++;

      //send the correctly guessed word to the back of list
      let curr = list.head;
      let count = mv;
      while (count > 0 && curr.next !== null) {
        curr = curr.next;
        count--;
      }
      const answer = new _Node(list.head.value);
      if (curr.next === null) {
        answer.next = curr.next;
        curr.next = answer;
        list.head = list.head.next;
        curr.value.next = answer.value.id;
        answer.value.next = answer.next.value.id;
      } else {
        answer.next = curr.next;
        curr.next = answer;
        list.head = list.head.next;
        curr.value.next = answer.value.id;
        answer.value.next = answer.next.value.id;
      }
      total_score++;
      await LanguageService.updateTables(
        db,
        makeArray(list),
        language,
        total_score
      );
      res.status(200).json({
        nextWord: list.head.value.original,
        totalScore: req.language.total_score,
        wordCorrectCount: list.head.value.correct_count,
        wordIncorrectCount: list.head.value.incorrect_count,
        answer: answer.value.translation,
        isCorrect: true,
      });
    } else {
      //incorrect guess
      list.head.value.memory_value = 1;
      list.head.value.incorrect_count++;

      let curr = list.head;
      let count = 1;
      while (count > 0) {
        curr = curr.next;
        count--;
      }
      const answer = new _Node(list.head.value);
      answer.next = curr.next;
      curr.next = answer;
      list.head = list.head.next;
      curr.value.next = answer.value.id;
      answer.value.next = answer.next.value.id;
      await LanguageService.updateTables(
        db,
        makeArray(list),
        language,
        total_score
      );

      res.status(200).json({
        nextWord: list.head.value.original,
        totalScore: req.language.total_score,
        wordCorrectCount: list.head.value.correct_count,
        wordIncorrectCount: list.head.value.incorrect_count,
        answer: answer.value.translation,
        isCorrect: false,
      });
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = languageRouter;
