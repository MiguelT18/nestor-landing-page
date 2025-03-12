import steps from "@data/form.json";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import Typewriter from "typewriter-effect";
import PhoneInput from "react-phone-input-2";
import { v4 as uuidv4 } from 'uuid';
import "react-phone-input-2/lib/style.css";
import "./styles.css";

type AnswerRecord = {
  question: string;
  answer: string | string[];
};

const STEPS_LEN = steps.length;

const questionVariants = {
  initial: {
    x: "100%",
    opacity: 0,
  },
  animate: {
    x: "0%",
    opacity: 1,
    height: "auto",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10,
      mass: 0.5,
      height: { duration: 0.3 },
    },
  },
  exit: {
    opacity: 0,
    height: "auto",
    transition: {
      height: { duration: 0.3 },
    },
  },
};

export default function Form() {
  const {
    register,
    trigger,
    formState: { errors },
    setValue,
  } = useForm();

  // Flag para indicar si se está en el cliente
  const [isMounted, setIsMounted] = useState(false);
  // Inicializa currentStep con 0 en el servidor
  const [currentStep, setCurrentStep] = useState<number>(0);
  // Teléfono
  const [phone, setPhone] = useState<string>("");
  // Puntuación
  const progress = Math.round(((currentStep + 1) / STEPS_LEN) * 100);
  // answers almacenará objetos { question, answer }, indexados por "step-1", "step-2", ...
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});
  const [wasSent, setWasSent] = useState<boolean>(false);

  // Efecto que se ejecuta al montar: recupera currentStep y todas las respuestas
  useEffect(() => {
    setIsMounted(true);
    // Recupera el paso actual
    const storedStep = localStorage.getItem("currentStep");
    if (storedStep) {
      setCurrentStep(parseInt(storedStep, 10));
    }
    // Carga todas las respuestas guardadas
    const loadedAnswers: Record<string, AnswerRecord> = {};
    for (let i = 0; i < STEPS_LEN; i++) {
      const key = `step-${i + 1}`;
      const storedAnswer = localStorage.getItem(key);
      if (storedAnswer) {
        loadedAnswers[key] = {
          question: steps[i].question,
          answer: JSON.parse(storedAnswer),
        };
      }
    }
    setAnswers(loadedAnswers);
  }, []);

  // Guarda el paso actual en localStorage cada vez que cambie
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem("currentStep", currentStep.toString());
    }
  }, [currentStep, isMounted]);

  // Evitamos renderizar hasta que se haya montado el componente
  if (!isMounted) return null;

  // handleAnswerChange recibe un string o string[], según sea un "single-choice" o "multiple-choice"
  const handleAnswerChange = (value: string | string[]) => {
    const stepKey = `step-${currentStep + 1}`;
    const currentQuestion = steps[currentStep].question;
    // Guarda la respuesta en localStorage
    localStorage.setItem(stepKey, JSON.stringify(value));
    setAnswers((prev) => ({
      ...prev,
      [stepKey]: {
        question: currentQuestion,
        answer: value,
      },
    }));
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    // Si ya estamos en el último
    if (currentStep === STEPS_LEN - 1) {
      if (wasSent) return;
      setWasSent(true);
      const TOKEN_EXPIRATION_MS = 3600 * 1000;
      const token = uuidv4();
      const expires = new Date(Date.now() + TOKEN_EXPIRATION_MS)
      localStorage.setItem("form-token", JSON.stringify({ token, expires }))

      try {
        const res = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(answers),
        });

        if (!res.ok) {
          throw new Error("Error al enviar el formulario");
        }

        alert("¡Gracias por tu tiempo! Hemos recibido tus respuestas.");
      } catch (error) {
        console.error("Error al enviar respuestas:", error);
        alert("Hubo un error al enviar tus respuestas. Inténtalo de nuevo.");
        setWasSent(false);
      }

      localStorage.removeItem("currentStep");
      for (let i = 0; i < STEPS_LEN; i++) {
        const key = `step-${i + 1}`;
        localStorage.removeItem(key);
      }
      window.location.pathname = "/schedule";
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleNext();
    }
  };

  const { question, label, type, options } = steps[currentStep];
  const stepKey = `step-${currentStep + 1}`;
  const record = answers[stepKey];
  let savedValue = record?.answer;

  return (
    <div
      className="size-full flex flex-col justify-between"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <div className="mb-8">
        <div className="mb-5">
          <div className="flex justify-between items-center gap-2 mb-2 [&>span]:text-sm [&>span]:block [&>span]:w-fit [&>span]:text-gray-400">
            <span>{progress}%</span>
            <span>100%</span>
          </div>
          <span
            className="block w-full h-4 rounded-2xl bg-white relative progress-bar"
            style={{ "--progress": progress + "%" } as React.CSSProperties}
          />
        </div>

        <div className="mb-4 flex flex-col w-fit gap-2">
          <strong className="text-md">
            <Typewriter
              key={currentStep}
              options={{
                autoStart: true,
                delay: 30,
                loop: false,
              }}
              onInit={(typewriter) => {
                typewriter.typeString(question).pauseFor(3000).start();
              }}
            />
          </strong>
          {label && <span className="text-gray-400 text-sm">{label}</span>}
        </div>

        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentStep}
            variants={questionVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="size-full"
            style={{ originX: 0, originY: 0 }}
          >
            {type === "single-choice" && (
              <ul className="space-y-2">
                {options?.map((opt: string, idx: number) => {
                  const isSelected = savedValue === opt;
                  return (
                    <li key={idx}>
                      <label className="cursor-pointer text-sm flex items-center gap-2 hover:text-primary-color/80 transition-all">
                        <div className="relative size-fit">
                          <input
                            {...register(`step-${currentStep}`, {
                              required: "Este campo es obligatorio",
                            })}
                            type="radio"
                            value={opt}
                            checked={isSelected}
                            onChange={() => handleAnswerChange(opt)}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-gray-500 hover:bg-primary-color/30 checked:border-gray-300 checked:bg-primary-color/30 transition-all"
                          />
                          <span className="absolute bg-gray-300 w-2 h-2 rounded-full opacity-0 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[90%]"></span>
                        </div>
                        <span
                          className={`block w-full p-2 rounded-md hover:bg-primary-color/25 ${
                            isSelected
                              ? "text-primary-color bg-primary-color/25"
                              : ""
                          }`}
                        >
                          {opt}
                        </span>
                      </label>
                    </li>
                  );
                })}
                {errors[`step-${currentStep}`] && (
                  <span className="block text-orange-500 mt-2 text-sm">
                    {errors[`step-${currentStep}`]?.message?.toString()}
                  </span>
                )}
              </ul>
            )}

            {type === "multiple-choice" && (
              <ul className="space-y-2">
                {options?.map((opt: string, idx: number) => {
                  // Creamos una variable multipleChoiceVal SIEMPRE array
                  const multipleChoiceVal: string[] = Array.isArray(savedValue)
                    ? savedValue
                    : [];
                  const isChecked = multipleChoiceVal.includes(opt);

                  const handleCheckChange = () => {
                    let newVal: string[];
                    if (isChecked) {
                      // Filtrar la opción
                      newVal = multipleChoiceVal.filter((o) => o !== opt);
                    } else {
                      // Agregarla
                      newVal = [...multipleChoiceVal, opt];
                    }
                    handleAnswerChange(newVal);
                  };

                  return (
                    <li key={idx}>
                      <label className="cursor-pointer text-sm flex items-center gap-4 hover:text-primary-color transition-all">
                        <div className="relative">
                          <input
                            type="checkbox"
                            {...register(`step-${currentStep}-cb`, {
                              required: "Este campo es obligatorio",
                            })}
                            value={opt}
                            checked={isChecked}
                            onChange={handleCheckChange}
                            className="peer h-5 w-5 cursor-pointer appearance-none rounded-sm border border-gray-500 hover:bg-primary-color/30 checked:border-gray-300 checked:bg-primary-color/30 transition-all"
                          />
                          <span className="absolute text-white opacity-0 peer-checked:opacity-100 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-[70%] pointer-events-none">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-3.5 w-3.5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                              stroke="currentColor"
                              strokeWidth="1"
                            >
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                          </span>
                        </div>

                        <span
                          className={`block w-full p-2 rounded-md hover:bg-primary-color/25 ${
                            isChecked
                              ? "text-primary-color bg-primary-color/25"
                              : ""
                          }`}
                        >
                          {opt}
                        </span>
                      </label>
                    </li>
                  );
                })}
                {errors[`step-${currentStep}-cb`] && (
                  <span className="block text-orange-500 mt-2 text-sm">
                    {errors[`step-${currentStep}-cb`]?.message?.toString()}
                  </span>
                )}
              </ul>
            )}

            {type === "text" && (
              <div>
                <input
                  type="text"
                  placeholder="Escribe tu respuesta"
                  {...register(`step-${currentStep}`, {
                    required: "Este campo es obligatorio",
                    minLength: {
                      value: 3,
                      message: "Debe tener al menos 3 caracteres",
                    },
                  })}
                  value={typeof savedValue === "string" ? savedValue : ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 rounded-md bg-[#2A0000] placeholder:text-gray-500 focus:outline-none focus:bg-[#3D0000] text-sm"
                />
                {errors[`step-${currentStep}`] && (
                  <span className="block text-orange-500 mt-2 text-sm">
                    {errors[`step-${currentStep}`]?.message?.toString()}
                  </span>
                )}
              </div>
            )}

            {type === "tel" && (
              <div className="inline-block">
                <PhoneInput
                  country="bo"
                  value={phone}
                  disableSearchIcon={true}
                  placeholder="(201) 555-0123"
                  enableSearch={true}
                  specialLabel=""
                  searchPlaceholder="Busca país..."
                  searchClass="tel-search-custom"
                  containerClass="tel-container-custom"
                  inputClass="tel-input-custom"
                  buttonClass="tel-button-custom"
                  dropdownClass="tel-dropdown-custom"
                  {...register(`step-${currentStep}`, {
                    required: "Tu número de teléfono es obligatorio",
                    pattern: {
                      value: /^\+?\d{7,15}$/,
                      message: "Número de teléfono inválido",
                    },
                  })}
                  onChange={(value, countryData) => {
                    let dialCode = "";
                    if (countryData && typeof countryData === "object") {
                      if ("dialCode" in countryData) {
                        dialCode = (countryData as any).dialCode;
                      } else if ("dial_code" in countryData) {
                        dialCode = (countryData as any).dial_code;
                      }
                    }

                    if (!dialCode) {
                      const match = value.match(/^\+(\d+)/);
                      dialCode = match ? match[1] : "";
                    }

                    let raw = value;
                    if (raw.startsWith(`+${dialCode}`)) {
                      raw = raw.slice(dialCode.length + 1);
                    } else if (raw.startsWith(dialCode)) {
                      raw = raw.slice(dialCode.length);
                    }

                    const formatted = dialCode
                      ? `+${dialCode} ${raw.trim()}`
                      : value;
                    setPhone(formatted);
                    handleAnswerChange(formatted);

                    setValue(`step-${currentStep}`, value, {
                      shouldValidate: true,
                    });
                    trigger(`step-${currentStep}`);
                  }}
                />

                {errors[`step-${currentStep}`] && (
                  <span className="block text-orange-500 mt-2 text-sm">
                    {errors[`step-${currentStep}`]?.message?.toString()}
                  </span>
                )}
              </div>
            )}

            {type === "email" && (
              <div>
                <input
                  {...register(`step-${currentStep}`, {
                    required: "Tu correo es obligatorio",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.com$/,
                      message: "Correo electrónico inválido",
                    },
                  })}
                  type="email"
                  placeholder="example@test.xyz"
                  value={typeof savedValue === "string" ? savedValue : ""}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full p-2 rounded-md bg-[#2A0000] placeholder:text-gray-500 focus:outline-none focus:bg-[#3D0000] text-sm"
                />
                {errors[`step-${currentStep}`] && (
                  <span className="block text-orange-500 mt-2 text-sm">
                    {errors[`step-${currentStep}`]?.message?.toString()}
                  </span>
                )}
              </div>
            )}

            {type === "textarea" && (
              <textarea
                rows={4}
                placeholder="Cuéntanos más..."
                value={typeof savedValue === "string" ? savedValue : ""}
                onChange={(e) => handleAnswerChange(e.target.value)}
                className="w-full p-2 rounded-md bg-primary-color/10 placeholder:text-gray-500 focus:outline-none focus:bg-primary-color/20 text-sm resize-none"
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex max-md:flex-col md:justify-between gap-4 justify-center">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0 ? true : false}
          className="border border-primary-color/50 hover:border-primary-color/30 hover:bg-primary-color/10 transition-all text-sm leading-tight tracking-wide px-4 py-3 rounded-md w-full disabled:border-primary-color/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Anterior
        </button>
        <button
          type="submit"
          disabled={wasSent}
          onClick={handleNext}
          className="bg-primary-color/50 hover:bg-primary-color/70 transition-all text-sm leading-tight tracking-wide px-4 py-3 rounded-md w-full disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-primary-color/50"
        >
          {currentStep === steps.length - 1 ? "Enviar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
