import React from "react";
import ReactDOM from "react-dom";

const App = () => {
  return (
    <section className="p-strip--suru-topped">
      <div className="row">
        <h1>Add exam content</h1>
      </div>
      <div className="row">
        <div className="col-6">
          <form method="post">
            <h2>Add a multiple choice question</h2>
            <label className="p-heading--4" htmlFor="question-title">
              Title
            </label>
            <input type="text" id="question-title" name="title" required />
            <label className="p-heading--4" htmlFor="question-text">
              Text
            </label>
            <textarea
              id="question-text"
              name="text"
              rows={5}
              required
            ></textarea>
            <label className="p-heading--4" htmlFor="question-option-a">
              Option A
            </label>
            <input
              type="text"
              id="question-option-a"
              name="option-a"
              required
            />
            <label className="p-heading--4" htmlFor="question-option-b">
              Option B
            </label>
            <input
              type="text"
              id="question-option-b"
              name="option-b"
              required
            />
            <label className="p-heading--4" htmlFor="question-option-c">
              Option C
            </label>
            <input
              type="text"
              id="question-option-c"
              name="option-c"
              required
            />
            <label className="p-heading--4" htmlFor="question-option-d">
              Option D
            </label>
            <input
              type="text"
              id="question-option-d"
              name="option-d"
              required
            />
            <button className="p-button--positive" type="submit" name="submit">
              Submit
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

ReactDOM.render(<App />, document.getElementById("cred-content"));
