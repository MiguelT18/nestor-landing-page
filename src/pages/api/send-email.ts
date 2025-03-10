import type { APIRoute } from "astro";
import { jsPDF } from "jspdf";
import nodemailer from "nodemailer";

export const POST: APIRoute = async ({ request }) => {
  const gmailUser = import.meta.env.GMAIL_USER;

  const data = await request.json();

  try {
    const doc = new jsPDF();

    let y_position = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const availableWidth = pageWidth - 2 * margin;
    const answerIndent = 10;
    const bulletPoint = "• ";

    // Función para obtener el ancho del texto
    function calculateTextWidth(
      text: string,
      fontSize: number,
      fontType: string
    ): number {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontType);
      return doc.getTextWidth(text);
    }

    // Función para obtener el alto del texto multilínea
    function calculateTextHeight(
      text: string,
      width: number,
      fontSize: number,
      fontType: string
    ): number {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontType);
      const wrappedText = doc.splitTextToSize(text, width);
      return wrappedText.length * (fontSize * 0.352778 * 1.15);
    }

    const addWrappedText = (
      text: string,
      x: number,
      y: number,
      width: number,
      fontSize: number,
      fontType: string
    ) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontType);
      const wrappedText = doc.splitTextToSize(text, width);
      wrappedText.forEach((line: string) => {
        doc.text(line, x, y);
        y += fontSize * 0.352778 * 1.15;
      });
      return y;
    };

    // Función para dividir texto si excede el ancho disponible
    const splitLongText = (
      text: string,
      fontSize: number,
      fontType: string,
      availableWidth: number
    ): string[] => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", fontType);
      const words = text.split(" ");
      const lines: string[] = [];
      let currentLine = "";

      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const textWidth = calculateTextWidth(testLine, fontSize, fontType);

        if (textWidth <= availableWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }

      lines.push(currentLine);
      return lines;
    };

    for (const stepKey in data) {
      if (data.hasOwnProperty(stepKey)) {
        const stepData = data[stepKey];
        const question = String(stepData.question);
        const answer = stepData.answer;

        y_position += 5;

        // Dividir la pregunta si excede el ancho disponible
        const questionLines = splitLongText(
          question,
          14,
          "bold",
          availableWidth
        );
        let questionHeight = calculateTextHeight(
          questionLines.join("\n"),
          availableWidth,
          14,
          "bold"
        );

        // Verificar si la pregunta cabe en la página actual
        if (y_position + questionHeight + 5 > pageHeight - margin) {
          doc.addPage();
          y_position = margin;
        }

        // Agregar la pregunta al PDF
        questionLines.forEach((line) => {
          y_position = addWrappedText(
            line,
            margin,
            y_position,
            availableWidth,
            14,
            "bold"
          );
        });
        y_position += 2;

        // Calcular la altura de la respuesta
        let answerHeight = 0;
        if (Array.isArray(answer)) {
          answer.forEach((item) => {
            const answerLines = splitLongText(
              item,
              12,
              "normal",
              availableWidth - answerIndent
            );
            answerHeight += calculateTextHeight(
              answerLines.join("\n"),
              availableWidth - answerIndent,
              12,
              "normal"
            );
          });
        } else {
          const answerLines = splitLongText(
            answer,
            12,
            "normal",
            availableWidth - answerIndent
          );
          answerHeight = calculateTextHeight(
            answerLines.join("\n"),
            availableWidth - answerIndent,
            12,
            "normal"
          );
        }

        // Verificar si la respuesta cabe en la página actual
        if (y_position + answerHeight + 5 > pageHeight - margin) {
          doc.addPage();
          y_position = margin;
        }

        // Agregar la respuesta al PDF
        if (Array.isArray(answer)) {
          answer.forEach((item) => {
            const answerLines = splitLongText(
              item,
              12,
              "normal",
              availableWidth - answerIndent
            );
            answerLines.forEach((line) => {
              y_position = addWrappedText(
                bulletPoint + line,
                margin + answerIndent,
                y_position,
                availableWidth - answerIndent,
                12,
                "normal"
              );
            });
          });
        } else {
          const answerLines = splitLongText(
            answer,
            12,
            "normal",
            availableWidth - answerIndent
          );
          answerLines.forEach((line) => {
            y_position = addWrappedText(
              line,
              margin + answerIndent,
              y_position,
              availableWidth - answerIndent,
              12,
              "normal"
            );
          });
        }

        y_position += 5;
      }
    }

    const pdfBytes = doc.output("arraybuffer");
    const pdfBuffer = Buffer.from(pdfBytes);

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: gmailUser,
        pass: "neiq crxg wkol jhrt",
      },
    });

    const mailOptions = {
      from: gmailUser,
      to: gmailUser,
      subject: "NUEVO USUARIO: Adjunto el formulario completado",
      attachments: [
        {
          filename: "formulario.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    };

    await transporter.sendMail(mailOptions);

    return new Response(
      JSON.stringify({ message: "Email sent with PDF attachment!" }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating PDF:", error);
    return new Response(JSON.stringify({ message: "Error creating PDF" }), {
      status: 500,
    });
  }
};
