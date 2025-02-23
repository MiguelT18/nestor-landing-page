import { useState } from "react";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import "./styles.css";

type AnswerRecord = {
  question: string;
  answer: string | string[];
};

interface Step {
  step: number;
  question: string;
  label: string;
  type:
    | "single-choice"
    | "multiple-choice"
    | "text"
    | "textarea"
    | "tel"
    | "email";
  options?: string[];
}

const steps: Step[] = [
  {
    step: 1,
    question: "¿Cuál es tu rango de edad?",
    label: "Selecciona tu rango de edad",
    type: "single-choice",
    options: ["18 a 34 años", "35 a 45 años", "Más de 45 años"],
  },
  {
    step: 2,
    question:
      "¿Cuál de las siguientes afirmaciones describe mejor tu situación?",
    label: "Selecciona tantas como quieras",
    type: "multiple-choice",
    options: [
      "Tengo un objetivo claro pero no sé cómo llegar allí. Hay demasiada información contradictoria y ya no quiero perder mi tiempo y energía experimentando.",
      "Ya he hecho dietas/retos antes, pero no he logrado los resultados que he querido. Me falta disciplina.",
      "Probé varias dietas y programas antes y perdí peso con éxito, pero lo  recuperé todo. Necesito solucionar este problema de una vez por todas.",
      "He hecho algunos progresos por mi cuenta, pero me estanqué y no sé cómo seguir progresando.",
      "He aumentado de peso con el pasar de los años y simplemente no puedo bajar",
      "Me siento extremadamente incómodo con mi cuerpo y eso está impactando todas las áreas de mi vida, incluida mi salud, mi confianza, mis relaciones y mi carrera.",
    ],
  },
  {
    step: 3,
    question: "¿Cómo es tu físico actual?",
    label: "Selecciona tu físico actual",
    type: "single-choice",
    options: [
      "Tengo sobrepeso: Deseo mejorar mi salud. Mi objetivo principal es bajar más de 15 kilos.",
      "Estoy fuera de Forma: Necesito bajar de 7 a 15 killos y lucir más atlético y definido.",
      "Delgado con grasa rebelde: Deseo eliminar mi grasa absominal y construir mejor mis músculos.",
    ],
  },
  {
    step: 4,
    question:
      "¿Qué tan importante es para ti en este momento alcanzar tus objetivos de peso?",
    label: "Selecciona tu nivel de importancia",
    type: "single-choice",
    options: [
      "(3 de 10) No tengo urgencia, estoy bien como estoy ahora, solo estoy buscando información.",
      "(5 de 10) Definitivamente estoy listo para comenzar a trabajar hacia mi objetivo. Tengo una motivación fuerte y es importante para mí.",
      "(7 de 10) Tengo que comenzar mi transformación lo antes posible. Estar fuera de forma está afectando mi día a día. Quiero aumentar mi autoestima y mejorar la salud, estoy cansado de no vivir la vida al máximo.",
      "(10 de 10) Estoy dispuesto a hacer todo lo necesario para solucionar mi situación actual. Simplemente no puedo dejar pasar un día más sin hacer un cambio. Me está afectando mental y físicamente.",
    ],
  },
  {
    step: 5,
    question:
      "¿Estás listo para comprometerte con un programa de acondicionamiento físico de 90 días ahora mismo?",
    label: "Selecciona si estás listo",
    type: "single-choice",
    options: [
      "Sí, sé que no se puede hacer ningún cambio significativo en un par de semanas. Crear nuevos hábitos sostenibles lleva tiempo.",
      "No, no estoy en condiciones de comprometerme con un programa de 90 días en este momento.",
    ],
  },
  {
    step: 6,
    question: "¿Qué tipo de asesoría buscas en mi?",
    label: "Selecciona el tipo de asesoría",
    type: "single-choice",
    options: [
      "Entrenamiento + Alimentación y Seguimiento Personalizado.",
      "Solo Alimentación y Seguimiento Personalizado.",
    ],
  },
  {
    step: 7,
    question:
      "¿Qué tan pronto deseas comenzar si somos aptos para trabajar juntos?",
    label: "Selecciona cuánto tiempo quieres comenzar",
    type: "single-choice",
    options: [
      "Sólo estoy aquí para recopilar información.",
      "Dentro de unas pocas semanas o un mes.",
      "Inmediatamente.",
    ],
  },
  {
    step: 8,
    question:
      "¿Está usted en condiciones de tomar decisiones financieras independientes?",
    label: "Selecciona si estás en condiciones",
    type: "single-choice",
    options: ["Si", "No"],
  },
  {
    step: 9,
    question: "¿Cuál es tu ocupación actual?",
    label: "Escribe tu ocupación actual",
    type: "text",
  },
  {
    step: 10,
    question: "¿Cuál es tu nombre?",
    label: "Escribe tu nombre",
    type: "text",
  },
  {
    step: 11,
    question: "¿Cuál es tu número de teléfono?",
    label: "Escribe tu número de teléfono",
    type: "tel",
  },
  {
    step: 12,
    question: "¿Cuál es tu correo electrónico?",
    label: "Escribe tu correo electrónico",
    type: "email",
  },
  {
    step: 13,
    question:
      "¿Cuál es el presupuesto aproximado que tienes en mente para lograr tus objetivos de salud y fitness trabajando conmigo?",
    label: "Selecciona el rango de tu presupuesto",
    type: "single-choice",
    options: [
      "Menos de $100 USD",
      "Entre $300 y $500 USD",
      "Entre $600 y $1000 USD",
    ],
  },
  {
    step: 14,
    question: "¿Hay algo más que deba saber sobre ti?",
    label: "Escribe algo más",
    type: "textarea",
  },
];

export default function Form() {
  // Índice del paso actual
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [phone, setPhone] = useState("");

  // answers almacenará objetos { question, answer }, indexados por "step-1", "step-2", ...
  const [answers, setAnswers] = useState<Record<string, AnswerRecord>>({});

  const handleNext = () => {
    if (currentStep === steps.length - 1) {
      // Si ya estamos en el último
      console.log("Respuestas finales: ", answers);
      // TODO: Enviar a backend
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  /**
   * handleAnswerChange recibe un string o string[], según sea un "single-choice" o "multiple-choice"
   */
  const handleAnswerChange = (value: string | string[]) => {
    const stepKey = `step-${currentStep + 1}`;
    const currentQuestion = steps[currentStep].question;

    // Guardamos un objeto con { question, answer }
    setAnswers((prev) => ({
      ...prev,
      [stepKey]: {
        question: currentQuestion,
        answer: value,
      },
    }));
  };

  // Extraemos la info del paso actual
  const { question, label, type, options } = steps[currentStep];

  // Buscamos si ya hay algo guardado en answers[stepKey]
  const stepKey = `step-${currentStep + 1}`;
  const record = answers[stepKey];
  // Si existe, extraemos su answer
  let savedValue = record?.answer;

  return (
    <div className="w-full md:max-w-[80%] mx-auto">
      <h2 className="text-center font-alfa-slab-one text-xl leading-relaxed uppercase">
        Formulario Personalizado
      </h2>

      <div className="mt-5 mb-8">
        <p className="text-sm mb-4 flex flex-col gap-2">
          <strong>{question}</strong>
          {label && <span className="text-gray-400">{label}</span>}
        </p>

        {type === "single-choice" && (
          <ul className="space-y-4">
            {options?.map((opt, idx) => {
              // Creamos una variable para saber si el valor actual es igual al valor de la opción
              const isSelected = savedValue === opt;

              return (
                <li key={idx}>
                  <label className="cursor-pointer text-sm flex items-center gap-4 hover:text-primary-color transition-all">
                    <input
                      type="radio"
                      name={`step-${currentStep}`}
                      value={opt}
                      checked={savedValue === opt}
                      onChange={() => handleAnswerChange(opt)}
                    />
                    <span
                      className={`block w-fit ${
                        isSelected ? "text-primary-color" : ""
                      }`}
                    >
                      {opt}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {type === "multiple-choice" && (
          <ul className="space-y-4">
            {options?.map((opt, idx) => {
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
                    <input
                      type="checkbox"
                      name={`step-${currentStep}-cb-${idx}`}
                      value={opt}
                      checked={isChecked}
                      onChange={handleCheckChange}
                    />
                    <span
                      className={`block w-fit ${
                        isChecked ? "text-primary-color" : ""
                      }`}
                    >
                      {opt}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        )}

        {type === "text" && (
          <input
            type="text"
            placeholder="Escribe tu respuesta"
            value={typeof savedValue === "string" ? savedValue : ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full p-2 rounded-md bg-primary-color/10 placeholder:text-gray-400 focus:outline-none focus:bg-primary-color/20 text-sm"
          />
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
              }}
            />
          </div>
        )}

        {type === "email" && (
          <input
            type="email"
            placeholder="example@test.xyz"
            className="w-full p-2 rounded-md bg-primary-color/10 placeholder:text-gray-400 focus:outline-none focus:bg-primary-color/20 text-sm"
          />
        )}

        {type === "textarea" && (
          <textarea
            rows={4}
            placeholder="Cuéntanos más..."
            value={typeof savedValue === "string" ? savedValue : ""}
            onChange={(e) => handleAnswerChange(e.target.value)}
            className="w-full p-2 rounded-md bg-primary-color/10 placeholder:text-gray-400 focus:outline-none focus:bg-primary-color/20 text-sm resize-none"
          />
        )}
      </div>

      <div className="flex max-md:flex-col md:justify-between gap-4 justify-center">
        <button
          onClick={handlePrev}
          disabled={currentStep === 0}
          className="border border-primary-color/50 hover:border-primary-color/30 hover:bg-primary-color/5 transition-all text-sm leading-tight tracking-wide px-4 py-2 rounded-md w-full disabled:border-primary-color/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        >
          Anterior
        </button>
        <button
          onClick={handleNext}
          className="bg-primary-color/50 hover:bg-primary-color/30 transition-all text-sm leading-tight tracking-wide px-4 py-2 rounded-md w-full"
        >
          {currentStep === steps.length - 1 ? "Finalizar" : "Siguiente"}
        </button>
      </div>
    </div>
  );
}
