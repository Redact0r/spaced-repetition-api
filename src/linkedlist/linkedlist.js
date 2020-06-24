class LinkedList {
  constructor() {
    //head is the first node in a list
    this.head = null;
  }
  insertFirst(item) {
    this.head = new _Node(item, this.head);
  }
  insertLast(item) {
    if (this.head === null) {
      //if no list, make this the first item
      this.insertFirst(item);
    } else {
      //store the first item
      let tempNode = this.head;
      //loop until you reach the one before the end
      while (tempNode.next !== null) {
        //set the old end as one before the node
        tempNode = tempNode.next;
      }
      //set the new next node as the new item/ending
      tempNode.next = new _Node(item, null);
    }
  }

  insertBefore(value, search) {
    //inserts a new node BEFORE a given node
    let temp = this.head;
    while (temp.next.value !== search) {
      temp = temp.next;
    }
    temp.next = new _Node(value, temp.next);
  }

  insertAfter(value, search) {
    //inserts an item at a specific position in the linked list
    let temp = this.head;
    while (temp.value !== search) {
      temp = temp.next;
    }
    temp.next = new _Node(value, temp.next);
  }

  insertAt(value, position) {
    let temp = this.head;
    let count = 0;

    while (temp.value !== null && count < position - 1) {
      temp = temp.next;
      count++;
    }
    temp.next = new _Node(value, temp.next);
  }

  find(item) {
    //start at the head
    let currNode = this.head;
    if (!this.head) {
      return null;
    }
    //check for the item
    while (currNode.value !== item) {
      /* Return null if it's the end of the list
                   and the item is not on the list */
      if (currNode.next === null) {
        return null;
      } else {
        //keep looking
        currNode = currNode.next;
      }
      return currNode;
    }
  }
  remove(item) {
    // If the list is empty
    if (!this.head) {
      return null;
    }
    // If the node to be removed is head, make the next node head
    if (this.head.value === item) {
      this.head = this.head.next;
      return;
    }
    // Start at the head
    let currNode = this.head;
    // Keep track of previous
    let previousNode = this.head;

    while (currNode !== null && currNode.value !== item) {
      // Save the previous node
      previousNode = currNode;
      currNode = currNode.next;
    }
    if (currNode === null) {
      console.log("Item not found");
      return;
    }
    previousNode.next = currNode.next;
  }
}

class _Node {
  constructor(value, next) {
    this.value = value;
    this.next = next;
  }
}

module.exports = { LinkedList, _Node };
