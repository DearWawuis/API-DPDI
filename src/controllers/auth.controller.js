const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";
const nodemailer = require("nodemailer");
const validator = require("validator");
const User = require("../models/User.model");

// Configurar nodemailer para enviar correos de confirmación
const transporter = nodemailer.createTransport({
  service: "gmail", // Usar un servicio como Gmail
  auth: {
    user: "it.solutions.207.itsol207@gmail.com",
    pass: "czwhwilyqluczdso",
  },
});

// Validar contraseña
const validatePassword = (password) => {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
  return passwordRegex.test(password);
};

// Registrar un usuario
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .send({ message: "Todos los campos son obligatorios." });
  }

  if (!validator.isEmail(email)) {
    return res.status(400).send({ message: "Correo no es válido." });
  }

  if (!validatePassword(password)) {
    return res.status(400).send({
      message:
        "La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, un número y un carácter especial.",
    });
  }

  // Verificar si el correo ya está registrado
  User.findByEmail(email, async (err, results) => {
    if (err) {
      return res.status(500).send({ message: "Error al verificar el correo." });
    }

    if (results.length > 0) {
      return res.status(409).send({ message: "El correo ya está registrado." });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar el usuario y generar un código de confirmación
    User.create(
      name,
      email,
      hashedPassword,
      (err, result, confirmationCode) => {
        if (err) {
          return res
            .status(500)
            .send({ message: "Error al registrar el usuario." });
        }

        // Enviar correo de confirmación
        const mailOptions = {
          from: "it.solutions.207.itsol207@gmail.com",
          to: email,
          subject: "Confirmación de registro",
          text: `Registro`,
          html: `
                <p>Hola ${name},</p>
                <p>Gracias por registrarte. Haz clic en el siguiente enlace para activar tu cuenta:</p>
                <p><a href="https://api-dpdi.vercel.app/api/verify/${confirmationCode}">Activar cuenta</a></p>
                <br/>
                <p>Atentamente / Kind regards,</p>
                <p><strong>IT Solutions</strong><br/>
                Ingeniero en Desarrollo y Gestión de Software<br/>
                Develop and Software Manage Engineer<br/>
                Phone: +52.442.397.1426 [XXX] | Mobile: +52.442.397.1426 | Email: it.solutions.207.itsol207@gmail.com<br/>
                IT Solutions S.A. de C.V., Calle CELESTE #XXX, Parque Industrial Querétaro, Santa Rosa Jáuregui, Qro. C.P. 76215, Querétaro, México<br/>
                RFC ISO20230611J0<br/>
                Administrator: Antonio Jiménez</p>
                <p><img src="https://blogger.googleusercontent.com/img/a/AVvXsEgFz9bC87AclJnw3fdIFZOaCO5Qv_xb3kw8dXyRS0QuiQqxEdgUXogFDpdePXxnTv7-lCB8MBPKogJe9OhVx1AydIEB0t5YcYO3ncmBeBAVrIXD0P5LrYpitkf2UzcIbPsYzcvQl_N6tvEEPEC8Al_F1vdr-lhlUgR9qC2E1UpW689tE2-B-kBSO4z5UFdd" alt="Logo de IT Solutions" /></p>
                <br/>
                <p>This e-mail may contain confidential and/or privileged information. If you are not the intended recipient or have received this e-mail in error please notify the sender immediately and delete this e-mail. Any unauthorized copying, disclosure or distribution of the material in this e-mail is strictly forbidden.</p>
                <p>IT Solutions S.A. de C.V. processes personal data according to the applicable legal provisions and detailed information regarding the processing and how to exercise data subject rights are available here: <a href="http://www.it-solutions.com/mx/files/download.php?filename=allgemeines/Aviso_de_Privacidad.pdf">Aviso de Privacidad</a>.</p>
            `,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            return res
              .status(500)
              .send({ message: "Error al enviar el correo de confirmación." });
          }

          res.send({
            message:
              "Usuario registrado exitosamente. Revisa tu correo para confirmar.",
          });
        });
      }
    );
  });
};

// Verificar correo
exports.verify = (req, res) => {
  const confirmationCode = req.params.confirmationCode;

  User.activateUser(confirmationCode, (err, result) => {
    if (err) {
      return res.status(500).send({ message: "Error al activar la cuenta." });
    }

    if (result.affectedRows === 0) {
      return res
        .status(400)
        .send({ message: "Código de verificación inválido." });
    }

    res.send({ message: "Cuenta activada exitosamente." });
  });
};

exports.login = (req, res) => {
  const { email, password } = req.body;

  // Validar que los campos requeridos estén presentes
  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "El correo y la contraseña son obligatorios" });
  }

  User.findByEmail(email, (err, results) => {
    if (err) {
      return res.status(500).send({ message: "Error al iniciar sesión." });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Correo no registrado" });
    }

    const user = results[0];

    // Verificar si el usuario ha verificado su correo
    if (!user.verificado) {
      return res.status(403).send({
        message: "Por favor, verifica tu correo antes de iniciar sesión.",
      });
    }

    bcrypt.compare(password, user.contrasena, (err, match) => {
      if (err) {
        return res
          .status(500)
          .send({ message: "Error al verificar la contraseña." });
      }

      if (!match) {
        return res.status(401).send({ message: "Contraseña incorrecta." });
      }

      // Generar un token JWT
      const token = jwt.sign(
        { id: user.id, email: user.correo }, // Payload del token
        process.env.SECRET, // Clave secreta
        { expiresIn: process.env.JWT_EXPIRES_IN || "1h" } // Tiempo de expiración
      );

      // Devolver el token y la información del usuario (sin la contraseña)
      const userResponse = {
        id: user.id,
        name: user.nombre,
        email: user.correo,
        roles: user.rol,
        verificado: user.verificado,
      };

      res.status(200).json({
        message: "Inicio de sesión exitoso",
        token,
        user: userResponse,
      });
    });
  });
};

/**
 * Eliminar una cuenta de usuario.
 * Requiere autenticación (token JWT).
 */
exports.deleteAccount = (req, res) => {
  try {
      // Obtener el ID del usuario autenticado
      const userId = req.user.id;

      // Eliminar al usuario de la base de datos
      User.deleteById(userId, (err, result) => {
          if (err) {
              console.error("Error al eliminar la cuenta:", err);
              return res.status(500).json({ message: "Error interno del servidor" });
          }

          if (result.affectedRows === 0) {
              return res.status(404).json({ message: "Usuario no encontrado" });
          }

          // Respuesta exitosa
          res.status(200).json({ message: "Cuenta eliminada exitosamente" });
      });
  } catch (error) {
      console.error("Error en deleteAccount:", error);
      res.status(500).json({ message: "Error interno del servidor" });
  }
};

// Controlador para validar el token
exports.validateToken = (req, res) => {
  // Si el middleware de autenticación no lanzó un error, el token es válido
  res.json({ valid: true });
};