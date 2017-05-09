# Final Project

<h2>Abstract</h2>
Despite the burgeoning success of Deep Neural Networks (DNNs) and their pervasion into myriad domains, ranging from art and music to science and medicine, their deep and complex architectures, innumerable parameters, and nonlinear activations render their inner workings nearly incomprehensible. This 'black box' nature of DNNs prohibits not only a robust intellectual understanding for academic endeavors and optimization engineering, but it also restricts these models and their exceptional pattern-recognition power to expert-users. Importantly, the lack of understanding how and why a DNN makes any particular decision also leads to significant legal liability for self-driving automobile companies and medical institutions. Interactive visualizations of DNNs may provide both expert and non-expert users the insight and intuition required to more optimally architect DNNs, as well as foster more confidence in their inner workings or reveal pitfalls to which solutions may be engineered. Based upon a review of current deep neural network visualization techniques, we have developed an interactive comparative visualization of DNN layer parameters and their distributions as they change with time-steps (epochs) in the DNN training sequence.

<h2>The Team</h2>

* **Michael Iuzzolino**

<h2>How to run the project</h2>

To run the project you must first download this repository, followed by the necessary model files:

**json_files** <a href="https://www.dropbox.com/sh/l5myz84ks98foxk/AACsj1utu41YuvgyX3n7xxMya?dl=0"> json_files </a>


Place the json_files into this repo's json_files directory.

Navigate to the repo in command line and run the command:
<code>
python -m http.server 8888
</code>
Navigate in-browser to <code> localhost:8888 </code> to launch the visualization.
