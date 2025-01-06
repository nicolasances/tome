# Topic Review

Tome is centered around the concept of a *Topic*. <br>
The Topic has multiple Sections, and that split exists mostly because of LLM limitations, but what needs to be reviewed, from a UX perspective, is the *Topic*. 

The **Topic Review** is a 360° review of a given Topic. 

Reviewing a topic does not mean reviewing each single section, but it means reviewing the topic as a whole, not just focusing on one section or on one section at a time. 

## How does it work? 

* A Topic Review is created. 
* To that TR, are associated (and generated) a **certain amount of questions**. Questions can cover **any** of the Topic's sections. They are not restricted to only one section.
* The TR is completed when all questions are answered. 

The `toto-ms-tome-agent` is responsible for creating a new Topic Review, including its questions. 