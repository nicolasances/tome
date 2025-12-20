# Tome

Tome is a web app to help memorize information read. 

Tome is based on a **Knowlege Base**, that is built upon a series of blogs, articles, books, and other documents that the user has read. 

---
## The Core Concepts

Tome revoles around simple concepts: 

1. **Topic** <br>
A Topic is something you need to remember. <br>
It can be a book, an article, anything.

2. **Challenges** <br>
Challenges are a way to gamify the memorization of Topics. <br>
There are different types of challenges, and they typically correspond to **difficulty levels**. The following challenges are currently supported: 
    * **Juice Challenge** - the easiest challenge, the user mostly need to remember: 
        * The core concepts or events of the topic 
        * The core dates and people involved

<br>

3. **Trial** <br>
A Trial is an instance of a Challenge. <br>
When a user starts a Challenge, a Trial is created. <br>

<br>

4. **Tests** (pp) <br>
They are the core element of Challenges and Trials. <br>
Each challenge is made of a series of Tests. <br>
Tests are questions that the user needs to answer to prove they have memorized the Topic. <br>
Tests can be of different types:
* Date Tests
* Free Text Tests 
* Genealogic Tree Tests
* Timeline Tests


![](./docs/drawings/model.drawio.svg)

---
## Resources

 * [Badges](./docs/badges.md)