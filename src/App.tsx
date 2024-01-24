import './globals.css'
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


const api_key = import.meta.env.VITE_API_KEY;

function App() {
  const [difficulty, setDifficulty] = useState("easy");
  const [tag, setTag] = useState<string | undefined>(undefined);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [main, setMain] = useState(true);
  const [showScore, setShowScore] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showQuestions, setShowQuestions] = useState(false);

  type Answer = {
    answer_a: string;
    answer_b: string;
    answer_c: string | null;
    answer_d: string | null;
    answer_e: string | null;
    answer_f: string | null;
  };

  type CorrectAnswer = {
    answer_a_correct: string;
    answer_b_correct: string;
    answer_c_correct: string | null;
    answer_d_correct: string | null;
    answer_e_correct: string | null;
    answer_f_correct: string | null;
  };

  type Question = {
    id: number;
    question: string;
    answers: Answer;
    correct_answers: CorrectAnswer;
  };

  const getRandomQuiz = async () => {
    console.log("fetching random quiz...");
    try {
      const response = await axios.get("https://quizapi.io/api/v1/questions", {
        params: {
          apiKey: `${api_key}`,
          limit: 10,
        },
      });
      const data = response;
      if (data.data) {
        setQuestions(data.data);
      }
      setMain(false);
      setShowQuestions(true);
    } catch (error) {
      console.log("Error fetching random questions: ", error);
    }
  };

   const getParamQuiz = async () => {
     console.log("fetching parameter quiz...");
     try {
       const response = await axios.get("https://quizapi.io/api/v1/questions", {
         params: {
           apiKey: `${api_key}`,
           limit: 10,
           difficulty: difficulty,
           tags: tag,
         },
       });
       if (response.data) {
         setQuestions(response.data);
       }
       setMain(false)
       setShowQuestions(true)
     } catch (error) {
       console.log("Error fetching parameter questions: ", error);
     }
   };


  const formSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    getParamQuiz();
    console.log(difficulty)
    console.log(tag)
  };

  const isCorrect = (question: Question, answerKey: string): boolean => {
    const key = `${answerKey}_correct` as keyof CorrectAnswer;
    return question.correct_answers[key] === "true";
  };

  const renderAnswers = (question: Question) => {
    return Object.entries(question.answers)
      .filter(([, answer]) => answer != null)
      .map(([key, answer]) => (
        <Button
          key={key}
          variant="default"
          onClick={() => {
            if (isCorrect(questions[currentQuestion], key)) {
              setScore(score + 1);
            }
            nextQuestion();
          }}
        >
          <p className="text-pretty">{answer}</p>
        </Button>
      ));
  };

  const nextQuestion = () => {
    if (currentQuestion === questions.length - 1) {
      setShowScore(true)
      setProgress(0)
      return;
    }
    setCurrentQuestion(currentQuestion + 1);
    setProgress(progress + 10);
  };
  
  return (
    <>
      <div className="flex flex-col items-center justify-center h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900 via-slate-900 to-black">
        <Button
          className="fixed top-5 left-10 border-3 border-gray-900"
          onClick={() => {
            setMain(true);
            setShowQuestions(false);
            setShowScore(false);
            setCurrentQuestion(0);
            setScore(0);
            setProgress(0);
          }}
        >
          Go home
        </Button>
        <div className="flex flex-col justify-around p-6 bg-gray-900/60 text-center border-2 border-gray-950 rounded-lg w-[60%] h-[50%]">
          {main && (
            <div
              id="start"
              className="flex flex-col items-center place-content-around p-0 m-0 h-full"
            >
              <h1 className="text-6xl w-full p-4 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-orange-400 via-cyan-200 to-sky-900 text-transparent bg-clip-text">
                Devquiz
              </h1>
              <p className="p-text">
                You can start a completely random quiz or select difficulty and
                category
              </p>
              <form onSubmit={formSubmitHandler} className="w-full">
                <div className="flex justify-around p-3">
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Easy</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={tag} onValueChange={setTag}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Javascript">Javascript</SelectItem>
                      <SelectItem value="HTML">HTML</SelectItem>
                      <SelectItem value="BASH">Bash</SelectItem>
                      <SelectItem value="PHP">PHP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-between p-4">
                  <Button
                    variant="default"
                    id="randomQuiz"
                    onClick={getRandomQuiz}
                  >
                    Get Random Quiz
                  </Button>
                  <Button variant="default" type="submit">
                    Get Quiz
                  </Button>
                </div>
              </form>
            </div>
          )}

          {showQuestions && !showScore && (
            <div className="h-full">
              {questions.length > 0 && (
                <div className="flex flex-col justify-around h-full gap-2 ">
                  <Progress value={progress} />
                  <p>{questions[currentQuestion].question}</p>
                  <div className="flex flex-wrap justify-between gap-1">
                    {renderAnswers(questions[currentQuestion])}
                  </div>
                </div>
              )}
            </div>
          )}
          <div>
            {showScore && (
              <div className="score-section">
                You scored {score} out of 10! 🎉
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

