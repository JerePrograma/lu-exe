'use client';

import { useMemo, useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const planOptions = [
  'Café tranquilo + charla sin apuro',
  'Pasta y charla linda',
  'Helado o algo dulce + caminata',
  'Película y algo rico',
  'Cena elegante pero sin pose',
  'Plan sorpresa, pero aprobado por QA',
];

const foodOptions = [
  'Pasta',
  'Milanesa napolitana',
  'Ensalada César',
  'Chop suey',
  'Tostados + café',
  'Medialunas rellenas',
  'Algo dulce con chocolatada',
  'Lo decidimos ese día',
];

const detailOptions = [
  'Jazmines',
  'Rosas',
  'Chocolate Cadbury',
  'Chocolate Oreo',
  'Ferrero',
  'Un libro',
  'Nada extra, solo el plan',
];

type Step = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type AlternateScreen = 'pause' | 'review' | 'success' | null;

const initialStep: Step = 0;

function formatDate(value: string) {
  if (!value) return 'Fecha por definir';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState<Step>(initialStep);
  const [alternateScreen, setAlternateScreen] = useState<AlternateScreen>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('');
  const [selectedFood, setSelectedFood] = useState('');
  const [selectedDetail, setSelectedDetail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const pdfContentRef = useRef<HTMLDivElement>(null);

  const summary = useMemo(
    () => ({
      Fecha: formatDate(selectedDate),
      Hora: selectedTime || 'Hora por definir',
      Plan: selectedPlan || 'Plan por elegir',
      'Comida/bebida': selectedFood || 'Lo decidimos ese día',
      'Detalle opcional': selectedDetail || 'Nada extra, solo el plan',
    }),
    [selectedDate, selectedDetail, selectedFood, selectedPlan, selectedTime],
  );

  function resetFlow() {
    setCurrentStep(initialStep);
    setAlternateScreen(null);
    setSelectedDate('');
    setSelectedTime('');
    setSelectedPlan('');
    setSelectedFood('');
    setSelectedDetail('');
    setErrorMessage('');
  }

  function goToStep(step: Step) {
    setErrorMessage('');
    setCurrentStep(step);
    setAlternateScreen(null);
  }

  function validateDateAndTime() {
    if (!selectedDate || !selectedTime) {
      setErrorMessage('Falta elegir fecha y hora. El backend emocional necesita esos datos.');
      return false;
    }

    setErrorMessage('');
    return true;
  }

  function goNext() {
    if (currentStep === 2 && !validateDateAndTime()) return;
    if (currentStep === 3 && !selectedPlan) {
      setErrorMessage('Elegí un tipo de plan para que el sistema pueda seguir.');
      return;
    }
    if (currentStep === 4 && !selectedFood) {
      setErrorMessage('Falta elegir el stack gastronómico.');
      return;
    }

    setErrorMessage('');
    setCurrentStep((step) => Math.min(step + 1, 6) as Step);
  }

  async function downloadPDF() {
    const element = pdfContentRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#f8f1ff',
        scale: 2,
        useCORS: true,
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a5' });
      const pageWidth = 148;
      const imgHeight = (canvas.height * pageWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, imgHeight);
      pdf.save('invitacion-lu-jere.pdf');
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  }

  const progressLabel = currentStep === 0 ? 'boot' : `paso ${currentStep} / 6`;
  const progressWidth = `${Math.max(currentStep, 1) * (100 / 6)}%`;

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <section className="invite-card" aria-live="polite">
        <header className="app-header">
          <div className="terminal-pill">jere@lu-exe:~$ npm run invitacion</div>
          <img className="cat-mark" src="/memes/gatito7.png" alt="Gatito discreto" />
          <p className="eyebrow">// invitación simple, cuidada y sin presión</p>
        </header>

        {alternateScreen === null && currentStep > 0 && (
          <div className="progress-area" aria-label={progressLabel}>
            <span>{progressLabel}</span>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: progressWidth }} />
            </div>
          </div>
        )}

        {alternateScreen === 'pause' && (
          <div className="screen center-screen">
            <span className="soft-icon">pause()</span>
            <h1>Sistema en pausa</h1>
            <p>
              Está bien, Lu. No hay presión.
              <br />
              Gracias por llegar hasta acá.
              <br />
              La invitación queda abierta, sin bugs raros ni contratos escondidos.
            </p>
            <button className="primary-button" type="button" onClick={resetFlow}>
              Volver al inicio
            </button>
          </div>
        )}

        {alternateScreen === 'review' && (
          <div className="screen center-screen">
            <span className="soft-icon">review.pending</span>
            <h1>Pendiente de review</h1>
            <p>
              Respuesta válida.
              <br />
              El sistema acepta tiempos humanos, aunque mi lado backend prefiera certezas.
            </p>
            <div className="button-row">
              <button className="primary-button" type="button" onClick={() => goToStep(2)}>
                Seguir viendo planes
              </button>
              <button className="ghost-button" type="button" onClick={resetFlow}>
                Volver al inicio
              </button>
            </div>
          </div>
        )}

        {alternateScreen === 'success' && (
          <div className="screen center-screen success-screen">
            <span className="soft-icon">status.ok</span>
            <h1>Plan confirmado</h1>
            <p>
              Gracias, Lu.
              <br />
              Nos vemos pronto.
              <br />
              Yo llevo la intención, vos traé tus ganas de pasarla bien.
            </p>
            <p className="muted-copy">Sin presión. Sin bugs raros. Sin morrón infiltrado.</p>
            <button className="primary-button" type="button" onClick={downloadPDF}>
              Descargar resumen
            </button>
          </div>
        )}

        {alternateScreen === null && currentStep === 0 && (
          <div className="screen intro-screen">
            <div className="code-window" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <h1>Lu.exe</h1>
            <h2>Una mini app para invitarte a salir sin romper producción.</h2>
            <p>
              Podría haberte mandado un mensaje normal, pero soy programador y aparentemente mi forma de
              ternura viene con deploy.
            </p>
            <button className="primary-button wide-button" type="button" onClick={() => goToStep(1)}>
              [ INICIAR INVITACIÓN ]
            </button>
          </div>
        )}

        {alternateScreen === null && currentStep === 1 && (
          <div className="screen">
            <span className="step-tag">// PASO 1: input inicial</span>
            <h1>Lu, ¿te pinta una salida conmigo?</h1>
            <p className="muted-copy">Sin presión, sin contrato, sin letra chica. Solo una invitación.</p>
            <div className="choice-grid three-options">
              <button className="choice-button" type="button" onClick={() => goToStep(2)}>
                Sí, me pinta
              </button>
              <button className="choice-button" type="button" onClick={() => setAlternateScreen('review')}>
                Lo pienso
              </button>
              <button className="choice-button calm-choice" type="button" onClick={() => setAlternateScreen('pause')}>
                Ahora no
              </button>
            </div>
          </div>
        )}

        {alternateScreen === null && currentStep === 2 && (
          <div className="screen">
            <span className="step-tag">// PASO 2: agenda.sync</span>
            <h1>Elegimos fecha y hora</h1>
            <p className="muted-copy">
              Seleccioná cuándo te quedaría cómodo. El sistema promete no ponerse intenso si hay que
              reprogramar.
            </p>
            <div className="field-grid">
              <label className="field-label">
                <span>Fecha</span>
                <input
                  value={selectedDate}
                  type="date"
                  onChange={(event) => setSelectedDate(event.target.value)}
                />
              </label>
              <label className="field-label">
                <span>Hora</span>
                <input
                  value={selectedTime}
                  type="time"
                  onChange={(event) => setSelectedTime(event.target.value)}
                />
              </label>
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="primary-button wide-button" type="button" onClick={goNext}>
              Continuar
            </button>
          </div>
        )}

        {alternateScreen === null && currentStep === 3 && (
          <div className="screen">
            <span className="step-tag">// PASO 3: plan.config</span>
            <h1>¿Qué tipo de plan te gustaría?</h1>
            <OptionGroup options={planOptions} selected={selectedPlan} onSelect={setSelectedPlan} />
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="primary-button wide-button" type="button" onClick={goNext}>
              Siguiente
            </button>
          </div>
        )}

        {alternateScreen === null && currentStep === 4 && (
          <div className="screen">
            <span className="step-tag">// PASO 4: stack.gastronómico</span>
            <h1>¿Qué stack gastronómico ejecutamos?</h1>
            <OptionGroup options={foodOptions} selected={selectedFood} onSelect={setSelectedFood} />
            <p className="technical-note">
              Nota técnica: sin morrón rebelde; cebolla solo bien picada. Leche deslactosada cuando aplique.
            </p>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
            <button className="primary-button wide-button" type="button" onClick={goNext}>
              Siguiente
            </button>
          </div>
        )}

        {alternateScreen === null && currentStep === 5 && (
          <div className="screen">
            <span className="step-tag">// PASO 5: detalle.opcional</span>
            <h1>¿Qué detalle suma puntos sin exagerar?</h1>
            <p className="muted-copy">Detalle opcional. El plan no depende de esto.</p>
            <OptionGroup options={detailOptions} selected={selectedDetail} onSelect={setSelectedDetail} />
            <button className="primary-button wide-button" type="button" onClick={goNext}>
              Ver resumen
            </button>
          </div>
        )}

        {alternateScreen === null && currentStep === 6 && (
          <div className="screen">
            <span className="step-tag">// PASO 6: resumen.final</span>
            <h1>Resumen de la invitación</h1>
            <SummaryList summary={summary} />
            <p className="final-copy">
              Prometo no hacer deploy directo a producción.
              <br />
              Solo una salida, una charla y pasarla bien.
            </p>
            <div className="button-row">
              <button className="primary-button" type="button" onClick={() => setAlternateScreen('success')}>
                Confirmar plan
              </button>
              <button className="ghost-button" type="button" onClick={() => goToStep(2)}>
                Editar
              </button>
            </div>
          </div>
        )}
      </section>

      <div className="pdf-stage" aria-hidden="true">
        <div id="pdf-confirmation" ref={pdfContentRef} className="pdf-card">
          <p className="pdf-kicker">Lu.exe</p>
          <h1>Lu.exe — Invitación confirmada</h1>
          <SummaryList summary={summary} compact />
          <p>
            Una salida simple, cuidada y sin presión.
            <br />
            Hecha por Jere para Lu.
          </p>
        </div>
      </div>
    </main>
  );
}

function OptionGroup({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  return (
    <div className="choice-grid">
      {options.map((option) => (
        <button
          className={`choice-button ${selected === option ? 'selected' : ''}`}
          key={option}
          type="button"
          aria-pressed={selected === option}
          onClick={() => onSelect(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function SummaryList({ summary, compact = false }: { summary: Record<string, string>; compact?: boolean }) {
  return (
    <dl className={compact ? 'summary-list compact' : 'summary-list'}>
      {Object.entries(summary).map(([label, value]) => (
        <div className="summary-row" key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
