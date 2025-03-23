const Photo = require('../models/Photo.model');

// Guardar una foto
const savePhoto = async (req, res) => {
  const { photo } = req.body; // Solo recibe la foto del cuerpo de la solicitud
  const userId = req.user.id; // Obtén el userId del usuario autenticado

  if (!photo) {
    return res.status(400).json({ message: 'No se proporcionó una foto.' });
  }

  // Validar que la cadena base64 es válida
  const regex = /^data:image\/([a-zA-Z]*);base64,([^\"]+)$/;
  if (!regex.test(photo)) {
    return res.status(400).json({ message: 'La foto no tiene un formato válido Base64.' });
  }

  try {
    const newPhoto = new Photo({ image: photo, userId });
    await newPhoto.save();
    res.status(201).json({ message: 'Foto guardada exitosamente', data: newPhoto });
  } catch (error) {
    console.error('Error al guardar la foto:', error);
    res.status(500).json({ message: 'Error al guardar la foto' });
  }
};

// Obtener todas las fotos
const getAllPhotos = async (req, res) => {
  const userId = req.user.id; // Obtener el ID del usuario autenticado

  try {
    const photos = await Photo.find({ userId }); // Filtrar por userId
    res.status(200).json(photos);
  } catch (error) {
    console.error('Error al obtener las fotos:', error);
    res.status(500).json({ message: 'Error al obtener las fotos' });
  }
};

const deletePhoto = async (req, res) => {
  const { photoId } = req.params;
  const userId = req.user.id; // Obtener el ID del usuario autenticado

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Foto no encontrada' });
    }

    // Verificar que el usuario es el propietario de la foto
    if (photo.userId !== Number(userId)) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta foto' });
    }

    const deletedPhoto = await Photo.findByIdAndDelete(photoId);
    res.status(200).json({ message: 'Foto eliminada exitosamente' });
  } catch (error) {
    console.error('Error al eliminar la foto:', error);
    res.status(500).json({ message: 'Error al eliminar la foto' });
  }
};

module.exports = {
  savePhoto,
  getAllPhotos,
  deletePhoto,
};
