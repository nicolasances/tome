# Practice Points

In Tome, Practice Points (PP) are accumulated **everytime a user answers a question in a flashcard**. 

The Core Principles are the following: 

> A PP is assigned when the user has learned something. <br>
*This can be learning from a wrong answer or answering correctly.*

## How it works
**Based on the type of flashcard**, PP are assigned at every answer to a question. 

| Flashcard Type | Rule |
|----------------|-------------|
| Options        | * Right answers generate RX points  <br> * Wrong answers **do not** generate points |
| Date           | * Right and Wrong answers generate RX points |
| Graph          | * Wrong answers **do not generate points** <br> * Finishing the flashcard generate x points, where x is the number of questions in the graph |


### Considerations 
* Wrong answers should not, in general, be rewarded, to avoid that the user **answers wrongly on purpose** to accumulate more points. <br>
*E.g. "Options" flashcards allow the user to answer many times and continue answering until she hits the right answer.* <br>
*Assigning points to wrong answers would incentivize selecting as many wrong answers as possible before answering correctly*. 

* An exception to the previous rule should be allowed for "date" flashcards, where a wrong answer leads the flashcard to show the right one. <br>
A User **can only answer once**. <br>
On top of that **there is learning value is answering wrongly** on this type of flashcard.

## Architecture & Flow

![](./drawings/practice-points.drawio.svg)