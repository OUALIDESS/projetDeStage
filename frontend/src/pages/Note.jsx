import React, { useState, useEffect, useRef } from 'react';
import { Button, Modal, Form, Alert, Card } from 'react-bootstrap';
import { BsPlus, BsTrash, BsPencil, BsTypeBold, BsTypeItalic, BsListOl } from 'react-icons/bs';

const Note = ({ theme }) => {
  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentNote, setCurrentNote] = useState(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [author, setAuthor] = useState('');
  const [background, setBackground] = useState('#ffffff');
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isOrderedList, setIsOrderedList] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState(null);

  const contentEditableRef = useRef(null);
  const fileInputRef = useRef(null);
  const storageKey = 'notes';

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    filterNotes();
  }, [searchQuery, notes]);

  const fetchNotes = () => {
    const storedNotes = localStorage.getItem(storageKey);
    if (storedNotes) {
      const parsedNotes = JSON.parse(storedNotes).map(note => ({
        ...note,
        background: note.background || '#ffffff',
      }));
      setNotes(parsedNotes);
      setFilteredNotes(parsedNotes);
    }
  };

  const filterNotes = () => {
    let result = notes;
    if (searchQuery) {
      result = result.filter((note) =>
        (note.title.toLowerCase() + note.content.toLowerCase() + (note.author || '').toLowerCase()).includes(searchQuery.toLowerCase())
      );
    }
    setFilteredNotes(result);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      return selection.getRangeAt(0);
    }
    return null;
  };

  const restoreSelection = (range) => {
    if (range) {
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    }
  };

  const checkFormattingState = (command) => {
    return document.queryCommandState(command);
  };

  const toggleBold = () => {
    if (contentEditableRef.current) {
      const range = saveSelection();
      contentEditableRef.current.focus();
      restoreSelection(range);

      const currentState = checkFormattingState('bold');
      document.execCommand('bold', false, null);
      const newState = !currentState;

      setIsBold(newState);
    }
  };

  const toggleItalic = () => {
    if (contentEditableRef.current) {
      const range = saveSelection();
      contentEditableRef.current.focus();
      restoreSelection(range);

      const currentState = checkFormattingState('italic');
      document.execCommand('italic', false, null);
      const newState = !currentState;

      setIsItalic(newState);
    }
  };

  const toggleOrderedList = () => {
    if (contentEditableRef.current) {
      const range = saveSelection();
      contentEditableRef.current.focus();
      restoreSelection(range);

      const currentState = checkFormattingState('insertOrderedList');
      document.execCommand('insertOrderedList', false, null);
      const newState = !currentState;

      setIsOrderedList(newState);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
        setBackground('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddOrEditNote = () => {
    if (!noteTitle.trim()) {
      setError('Le titre de la note est requis');
      return;
    }
    if (!noteContent.trim()) {
      setError('Le contenu de la note est requis');
      return;
    }

    let updatedNotes;
    const noteData = {
      id: currentNote ? currentNote.id : Date.now().toString(),
      title: noteTitle,
      content: contentEditableRef.current ? contentEditableRef.current.innerHTML : noteContent,
      dueDate: dueDate || null,
      author: author || 'Unknown',
      background: backgroundImage || background || '#ffffff',
      createdAt: currentNote ? currentNote.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (currentNote) {
      updatedNotes = notes.map((note) =>
        note.id === currentNote.id ? noteData : note
      );
    } else {
      updatedNotes = [...notes, noteData];
    }

    setNotes(updatedNotes);
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    setNoteTitle('');
    setNoteContent('');
    setDueDate('');
    setAuthor('');
    setBackground('#ffffff');
    setBackgroundImage(null);
    setCurrentNote(null);
    setIsBold(false);
    setIsItalic(false);
    setIsOrderedList(false);
    setShowModal(false);
    setError('');
  };

  const handleDeleteNote = (id) => {
    setNoteToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    const updatedNotes = notes.filter((note) => note.id !== noteToDelete);
    setNotes(updatedNotes);
    localStorage.setItem(storageKey, JSON.stringify(updatedNotes));
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
    setError('');
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setNoteToDelete(null);
  };

  const openEditModal = (note) => {
    setCurrentNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setDueDate(note.dueDate || '');
    setAuthor(note.author || '');
    setBackground(note.background || '#ffffff');
    setBackgroundImage(note.background && note.background.startsWith('data:image') ? note.background : null);
    setIsBold(false);
    setIsItalic(false);
    setIsOrderedList(false);
    setShowModal(true);

    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = note.content;
      }
    }, 0);
  };

  const openAddModal = () => {
    setCurrentNote(null);
    setNoteTitle('');
    setNoteContent('');
    setDueDate('');
    setAuthor('');
    setBackground('#ffffff');
    setBackgroundImage(null);
    setIsBold(false);
    setIsItalic(false);
    setIsOrderedList(false);
    setShowModal(true);

    setTimeout(() => {
      if (contentEditableRef.current) {
        contentEditableRef.current.innerHTML = '';
      }
    }, 0);
  };

  return (
    <div
      className="p-4"
      style={{
        backgroundColor: theme === 'dark' ? '#14131f' : '#ffffff',
        color: theme === 'dark' ? '#e0e0e0' : '#212529',
        minHeight: '100vh',
        marginLeft: '240px',
      }}
    >
      <style>
        {`
          .custom-button {
            background-color: var(--bg-color) !important;
            border-color: var(--bg-color) !important;
            color: var(--text-color) !important;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 2px 6px;
          }
          .custom-button:hover {
            opacity: 0.9;
          }
          .content-editable:focus {
            outline: none;
          }
          .content-editable strong {
            font-weight: bold;
          }
          .content-editable em {
            font-style: italic;
          }
          .content-editable ol {
            list-style-type: decimal;
            padding-left: 20px;
          }
          .content-editable li {
            margin-bottom: 5px;
          }
          .note-content strong {
            font-weight: bold;
          }
          .note-content em {
            font-style: italic;
          }
          .note-content ol {
            list-style-type: decimal;
            padding-left: 20px;
          }
          .note-content li {
            margin-bottom: 5px;
          }
          .alert-custom {
            background-color: ${theme === 'dark' ? '#7f1d1d' : '#f8d7da'};
            color: ${theme === 'dark' ? '#ffffff' : '#721c24'};
            border-color: ${theme === 'dark' ? '#991b1b' : '#f5c6cb'};
          }
          .modal-header, .modal-body {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#212529'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
          }
          .form-control, .form-control:focus {
            background-color: ${theme === 'dark' ? '#2a2a3a' : '#ffffff'};
            color: ${theme === 'dark' ? '#ffffff' : '#212529'};
            border-color: ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
          }
          .text-muted-custom {
            color: ${theme === 'dark' ? '#a0a0a0' : '#6c757d'} !important;
          }
          .card-custom {
            background-color: transparent;
            border: 1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'};
            border-radius: 5px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .card-body-custom {
            background-color: var(--note-bg);
            background-image: var(--note-bg-image);
            background-size: cover;
            background-position: center;
            border-radius: 5px;
            padding: 1rem;
            color: ${theme === 'dark' ? '#ffffff' : '#212529'};
          }
          .format-button svg {
            color: #000000 !important; /* Black icons in default state */
          }
          .format-button.active svg {
            color: #ffffff !important; /* White icons in active state */
          }
          .bg-option {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            border: 2px solid transparent;
            cursor: pointer;
            margin-right: 10px;
          }
          .bg-option.selected {
            border-color: ${theme === 'dark' ? '#ffffff' : '#000000'};
          }
        `}
      </style>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Notes</h2>
        <Button
          className="custom-button"
          style={{ '--bg-color': '#000000', '--text-color': '#ffffff' }} /* Black background, white text */
          size="sm"
          onClick={openAddModal}
        >
          <BsPlus size={12} /> Ajouter une note
        </Button>
      </div>

      <div className="mb-3 d-flex gap-3">
        <Form.Control
          type="text"
          placeholder="Rechercher des notes..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="form-control"
        />
      </div>

      {error && (
        <Alert className="alert-custom">
          {error}
        </Alert>
      )}
      {filteredNotes.length === 0 ? (
        <p>Aucune note disponible.</p>
      ) : (
        <div>
          {filteredNotes.map((note) => (
            <Card
              key={note.id}
              className="card-custom mb-2"
            >
              <Card.Body
                className="card-body-custom"
                style={{
                  '--note-bg': (note.background && note.background.startsWith('data:image')) ? 'transparent' : (note.background || '#ffffff'),
                  '--note-bg-image': (note.background && note.background.startsWith('data:image')) ? `url(${note.background})` : 'none',
                }}
              >
                <Card.Title>{note.title}</Card.Title>
                <Card.Text
                  className="note-content"
                  dangerouslySetInnerHTML={{ __html: note.content }}
                />
                {note.dueDate && (
                  <Card.Text>
                    <strong>Date d'échéance :</strong> {new Date(note.dueDate).toLocaleDateString()}
                  </Card.Text>
                )}
                {note.author && (
                  <Card.Text>
                    <strong>Auteur :</strong> {note.author}
                  </Card.Text>
                )}
                <div className="d-flex gap-2">
                  <Button
                    className="custom-button"
                    style={{ '--bg-color': '#000000', '--text-color': '#ffffff' }} /* Black background, white text */
                    size="sm"
                    onClick={() => openEditModal(note)}
                  >
                    <BsPencil size={12} /> Modifier
                  </Button>
                  <Button
                    className="custom-button"
                    style={{ '--bg-color': '#000000', '--text-color': '#ffffff' }} /* Black background, white text */
                    size="sm"
                    onClick={() => handleDeleteNote(note.id)}
                  >
                    <BsTrash size={12} /> Supprimer
                  </Button>
                </div>
                <div className="mt-2 text-muted-custom" style={{ fontSize: '0.8rem' }}>
                  <div>Créé : {new Date(note.createdAt).toLocaleString()}</div>
                  {note.updatedAt && <div>Modifié : {new Date(note.updatedAt).toLocaleString()}</div>}
                </div>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}

      <Modal
        show={showModal}
        onHide={() => {
          setShowModal(false);
          setError('');
          setCurrentNote(null);
        }}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>{currentNote ? 'Modifier la note' : 'Ajouter une nouvelle note'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert className="alert-custom">{error}</Alert>}
          <Form onSubmit={(e) => { e.preventDefault(); handleAddOrEditNote(); }}>
            <Form.Group className="mb-3">
              <Form.Label>Titre</Form.Label>
              <Form.Control
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Entrez le titre de la note"
                className="form-control"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Auteur</Form.Label>
              <Form.Control
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Entrez le nom de l'auteur"
                className="form-control"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Contenu de la note</Form.Label>
              <div style={{
                border: `1px solid ${theme === 'dark' ? '#4a4a5a' : '#dee2e6'}`,
                borderRadius: '4px',
                padding: '5px',
                backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
              }}>
                <div style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                  <Button
                    className={`custom-button format-button ${isBold ? 'active' : ''}`}
                    style={{
                      '--bg-color': isBold ? '#000000' : (theme === 'dark' ? '#4a4a5a' : '#dee2e6'),
                      '--text-color': '#ffffff',
                    }}
                    size="sm"
                    onClick={toggleBold}
                  >
                    <BsTypeBold />
                  </Button>
                  <Button
                    className={`custom-button format-button ${isItalic ? 'active' : ''}`}
                    style={{
                      '--bg-color': isItalic ? '#000000' : (theme === 'dark' ? '#4a4a5a' : '#dee2e6'),
                      '--text-color': '#ffffff',
                    }}
                    size="sm"
                    onClick={toggleItalic}
                  >
                    <BsTypeItalic />
                  </Button>
                  <Button
                    className={`custom-button format-button ${isOrderedList ? 'active' : ''}`}
                    style={{
                      '--bg-color': isOrderedList ? '#000000' : (theme === 'dark' ? '#4a4a5a' : '#dee2e6'),
                      '--text-color': '#ffffff',
                    }}
                    size="sm"
                    onClick={toggleOrderedList}
                  >
                    <BsListOl />
                  </Button>
                </div>
                <div
                  ref={contentEditableRef}
                  contentEditable
                  className="content-editable"
                  style={{
                    minHeight: '100px',
                    padding: '5px',
                    backgroundColor: theme === 'dark' ? '#2a2a3a' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#212529',
                    wordWrap: 'break-word',
                    caretColor: theme === 'dark' ? '#ffffff' : '#212529',
                    direction: 'ltr',
                  }}
                  onInput={(e) => setNoteContent(e.currentTarget.innerHTML)}
                  suppressContentEditableWarning={true}
                />
              </div>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Arrière-plan de la note</Form.Label>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <div
                  className={`bg-option ${background === '#ffffff' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#ffffff' }}
                  onClick={() => { setBackground('#ffffff'); setBackgroundImage(null); }}
                />
                <div
                  className={`bg-option ${background === '#f0f0f0' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#f0f0f0' }}
                  onClick={() => { setBackground('#f0f0f0'); setBackgroundImage(null); }}
                />
                <div
                  className={`bg-option ${background === '#e6f3ff' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#e6f3ff' }}
                  onClick={() => { setBackground('#e6f3ff'); setBackgroundImage(null); }}
                />
                <div
                  className={`bg-option ${background === '#fff3cd' ? 'selected' : ''}`}
                  style={{ backgroundColor: '#fff3cd' }}
                  onClick={() => { setBackground('#fff3cd'); setBackgroundImage(null); }}
                />
              </div>
              <Form.Label>Ou importer une image</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleImageUpload}
                className="form-control"
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date d'échéance</Form.Label>
              <Form.Control
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="form-control"
              />
            </Form.Group>
            <div className="d-flex justify-content-between">
              <Button
                className="custom-button"
                style={{ '--bg-color': '#000000', '--text-color': '#ffffff' }} /* Black background, white text */
                onClick={() => setShowModal(false)}
              >
                Retour
              </Button>
              <Button
                className="custom-button"
                style={{ '--bg-color': '#000000', '--text-color': '#ffffff' }} /* Black background, white text */
                type="submit"
              >
                Étape suivante
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {showDeleteConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100"
          style={{
            backgroundColor: theme === 'dark' ? 'rgba(20, 19, 31, 0.8)' : 'rgba(0, 0, 0, 0.5)',
            zIndex: 1050,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Card
            className="card-custom"
            style={{ width: '20rem' }}
          >
            <Card.Body
              className="card-body-custom"
              style={{
                '--note-bg': theme === 'dark' ? '#2a2a3a' : '#ffffff',
                '--note-bg-image': 'none',
              }}
            >
              <Card.Title>Confirmer la suppression</Card.Title>
              <Card.Text>Êtes-vous sûr de vouloir supprimer cette note ?</Card.Text>
              <div className="d-flex justify-content-center gap-3 mt-3">
                <Button
                  className="custom-button"
                  style={{ '--bg-color': '#000000', '--text-color': '#ffffff' }} /* Black background, white text */
                  onClick={confirmDelete}
                >
                  Oui
                </Button>
                <Button
                  className="custom-button"
                  style={{ '--bg-color': '#000000', '--text-color': '#ffffff' }} /* Black background, white text */
                  onClick={cancelDelete}
                >
                  Non
                </Button>
              </div>
            </Card.Body>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Note;