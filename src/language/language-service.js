const { LinkedList, _Node } = require("..//linkedlist/linkedlist");

const LanguageService = {
  getUsersLanguage(db, user_id) {
    return db
      .from("language")
      .select(
        "language.id",
        "language.name",
        "language.user_id",
        "language.head",
        "language.total_score"
      )
      .where("language.user_id", user_id)
      .first();
  },

  getLanguageWords(db, language_id) {
    return db
      .from("word")
      .select(
        "id",
        "language_id",
        "original",
        "translation",
        "next",
        "memory_value",
        "correct_count",
        "incorrect_count"
      )
      .where({ language_id });
  },
  getNextWord(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "=", "language.head")
      .select("original", "language_id", "correct_count", "incorrect_count")
      .where({ language_id });
  },
  checkGuess(db, language_id) {
    return db
      .from("word")
      .join("language", "word.id", "=", "language.head")
      .select("*")
      .where({ language_id });
  },

  getHead(db, language_id) {
    return db
      .from("language")
      .join("word", "word.language_id", "=", "language.id")
      .select("head")
      .groupBy("head")
      .where({ language_id });
  },
  generateLinkedList(words, head) {
    const currentHead = words.find((word) => word.id === head);
    const headNodeIdx = words.indexOf(currentHead);
    const headNode = words.splice(headNodeIdx, 1);
    const list = new LinkedList();
    list.insertLast(headNode[0]);

    let nextIdx = headNode[0].next;
    let currentWord = words.find((word) => word.id === nextIdx);
    list.insertLast(currentWord);
    nextIdx = currentWord.next;
    currentWord = words.find((word) => word.id === nextIdx);

    //generates list via loop given current db
    while (currentWord !== null) {
      list.insertLast(currentWord);
      nextIdx = currentWord.next;
      if (nextIdx === null) {
        currentWord = null;
      } else {
        currentWord = words.find((word) => word.id === nextIdx);
      }
      return list;
    }
  },
  updateTables(db, words, language_id, total_score) {
    return db.transaction(async (trx) => {
      return Promise.all([
        trx("language")
          .where({ id: language_id })
          .update({ head: words[0].id, total_score }),
        //Map through and provide an update to each individual word table in the db
        ...words.map((word, i) => {
          if (i + 1 >= words.length) {
            word.next = null;
          } else {
            word.next = words[i + 1].id;
          }
          return trx("word")
            .where({ id: word.id })
            .update({ ...word });
        }),
      ]);
    });
  },
};

module.exports = LanguageService;
