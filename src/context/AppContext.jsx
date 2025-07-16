// Update AppContext.jsx to ensure SMTP settings are properly initialized
import React, { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext();

const initialState = {
  user: {
    id: 1,
    name: 'Emanuele Marchiori',
    email: 'emanuele@copilots.it',
    role: 'Super Admin',
    avatar: null,
    permissions: ['all']
  },
  isAuthenticated: false,
  company: {
    name: 'Diplomati Online',
    logo: null,
    vatId: 'IT12345678901',
    sdiCode: 'ABCDEFG',
    address: 'Via Roma 123',
    city: 'Milano',
    province: 'MI',
    cap: '20100',
    email: 'info@diplomatonline.it',
    pec: 'pec@diplomatonline.it',
    phone: '+39 02 1234567',
    whatsapp: '+39 320 1234567',
    notes: 'Azienda leader nella formazione online per il recupero anni scolastici'
  },
  users: [
    {
      id: 1,
      name: 'Emanuele Marchiori',
      email: 'admin@diplomatonline.it',
      role: 'Super Admin',
      status: 'active',
      lastLogin: new Date().toISOString(),
      permissions: ['all'],
      avatar: null
    }
  ],
  students: [],
  schools: [],
  courses: [],
  leads: [],
  notifications: [],
  appointments: [],
  documents: [],
  tasks: [],
  quotes: [],
  payments: [],
  invoices: [],
  settings: {
    theme: 'nordic',
    language: 'it',
    emailSettings: {
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: 'noreply@diplomatonline.it',
      smtpPassword: '',
      fromEmail: 'noreply@diplomatonline.it',
      fromName: 'Diplomati Online'
    },
    integrations: {
      zapier: {
        active: false,
        apiKey: '',
        webhookUrl: '',
        lastSync: null
      },
      openai: {
        active: false,
        apiKey: '',
        model: 'gpt-4',
        maxTokens: 1000,
        temperature: 0.7
      },
      meta: {
        active: false,
        pixelId: '',
        accessToken: '',
        testMode: false
      },
      gtm: {
        active: false,
        containerId: '',
        trackingId: '',
        enhancedEcommerce: true
      },
      facebook: {
        active: false,
        pixelId: '',
        advancedMatching: true,
        automaticEvents: true
      },
      smtp: {
        active: false,
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        username: 'noreply@diplomatonline.it',
        password: '',
        fromName: 'Diplomati Online'
      }
    }
  }
};

function appReducer(state, action) {
  switch (action.type) {
    // Authentication Actions
    case 'LOGIN':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: true };
    case 'CHECK_AUTH':
      return { ...state, isAuthenticated: action.payload.isAuthenticated, user: action.payload.user };

    // User Actions
    case 'ADD_USER':
      return { ...state, users: [...state.users, action.payload] };
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? { ...user, ...action.payload } : user
        )
      };
    case 'DELETE_USER':
      return { ...state, users: state.users.filter(user => user.id !== action.payload) };

    // Company Actions
    case 'SET_COMPANY':
      return { ...state, company: { ...state.company, ...action.payload } };

    // Settings Actions
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_INTEGRATION':
      return {
        ...state,
        settings: {
          ...state.settings,
          integrations: {
            ...state.settings.integrations,
            [action.payload.key]: {
              ...state.settings.integrations[action.payload.key],
              ...action.payload.data
            }
          }
        }
      };

    // Student Actions
    case 'ADD_STUDENT':
      return { ...state, students: [...state.students, action.payload] };
    case 'UPDATE_STUDENT':
      return {
        ...state,
        students: state.students.map(student => 
          student.id === action.payload.id ? { ...student, ...action.payload } : student
        )
      };
    case 'DELETE_STUDENT':
      return { ...state, students: state.students.filter(student => student.id !== action.payload) };

    // School Actions
    case 'ADD_SCHOOL':
      return { ...state, schools: [...state.schools, action.payload] };
    case 'UPDATE_SCHOOL':
      return {
        ...state,
        schools: state.schools.map(school => 
          school.id === action.payload.id ? { ...school, ...action.payload } : school
        )
      };
    case 'DELETE_SCHOOL':
      return { ...state, schools: state.schools.filter(school => school.id !== action.payload) };

    // Course Actions
    case 'ADD_COURSE':
      return { ...state, courses: [...state.courses, action.payload] };
    case 'UPDATE_COURSE':
      return {
        ...state,
        courses: state.courses.map(course => 
          course.id === action.payload.id ? { ...course, ...action.payload } : course
        )
      };
    case 'DELETE_COURSE':
      return { ...state, courses: state.courses.filter(course => course.id !== action.payload) };

    // Lead Actions
    case 'ADD_LEAD':
      return { ...state, leads: [...state.leads, action.payload] };
    case 'UPDATE_LEAD':
      return {
        ...state,
        leads: state.leads.map(lead => 
          lead.id === action.payload.id ? { ...lead, ...action.payload } : lead
        )
      };
    case 'DELETE_LEAD':
      return { ...state, leads: state.leads.filter(lead => lead.id !== action.payload) };

    // Task Actions
    case 'ADD_TASK':
      return { ...state, tasks: [...state.tasks, action.payload] };
    case 'UPDATE_TASK':
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? { ...task, ...action.payload } : task
        )
      };
    case 'DELETE_TASK':
      return { ...state, tasks: state.tasks.filter(task => task.id !== action.payload) };

    // Quote Actions
    case 'ADD_QUOTE':
      return { ...state, quotes: [...state.quotes, action.payload] };
    case 'UPDATE_QUOTE':
      return {
        ...state,
        quotes: state.quotes.map(quote => 
          quote.id === action.payload.id ? { ...quote, ...action.payload } : quote
        )
      };
    case 'DELETE_QUOTE':
      return { ...state, quotes: state.quotes.filter(quote => quote.id !== action.payload) };

    // Payment Actions
    case 'ADD_PAYMENT':
      return { ...state, payments: [...state.payments, action.payload] };
    case 'UPDATE_PAYMENT':
      return {
        ...state,
        payments: state.payments.map(payment => 
          payment.id === action.payload.id ? { ...payment, ...action.payload } : payment
        )
      };

    // Invoice Actions
    case 'ADD_INVOICE':
      return { ...state, invoices: [...state.invoices, action.payload] };
    case 'UPDATE_INVOICE':
      return {
        ...state,
        invoices: state.invoices.map(invoice => 
          invoice.id === action.payload.id ? { ...invoice, ...action.payload } : invoice
        )
      };

    // Notification Actions
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(notif => notif.id !== action.payload) };
    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    // Appointment Actions
    case 'ADD_APPOINTMENT':
      return { ...state, appointments: [...state.appointments, action.payload] };
    case 'UPDATE_APPOINTMENT':
      return {
        ...state,
        appointments: state.appointments.map(apt => 
          apt.id === action.payload.id ? { ...apt, ...action.payload } : apt
        )
      };
    case 'DELETE_APPOINTMENT':
      return { ...state, appointments: state.appointments.filter(apt => apt.id !== action.payload) };

    // Document Actions
    case 'ADD_DOCUMENT':
      return { ...state, documents: [...state.documents, action.payload] };
    case 'DELETE_DOCUMENT':
      return { ...state, documents: state.documents.filter(doc => doc.id !== action.payload) };

    default:
      return state;
  }
}

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Check authentication on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const token = localStorage.getItem('authToken');
      const currentUser = localStorage.getItem('currentUser');

      if (token && currentUser) {
        const decodedToken = JSON.parse(atob(token));
        const userData = JSON.parse(currentUser);

        // Check if token is expired
        if (decodedToken.expires > Date.now()) {
          dispatch({
            type: 'CHECK_AUTH',
            payload: { isAuthenticated: true, user: userData }
          });
        } else {
          // Token expired, clear storage
          logout();
        }
      } else {
        dispatch({
          type: 'CHECK_AUTH',
          payload: { isAuthenticated: false, user: null }
        });
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    dispatch({ type: 'LOGOUT' });
  };

  // Load initial sample data
  useEffect(() => {
    if (state.isAuthenticated) {
      loadSampleData();
    }
  }, [state.isAuthenticated]);

  const loadSampleData = () => {
    // Load sample data only if authenticated
    const sampleStudents = [
      {
        id: 1,
        firstName: 'Marco',
        lastName: 'Rossi',
        email: 'marco.rossi@email.com',
        phone: '+39 320 123 4567',
        codiceFiscale: 'RSSMRC90A01H501Z',
        birthDate: '1990-01-01',
        birthPlace: 'Roma',
        address: 'Via Roma 123',
        city: 'Roma',
        province: 'RM',
        cap: '00100',
        course: 'Diploma Scientifico',
        courseId: 1,
        yearsToRecover: 2,
        enrollmentDate: '2024-01-15',
        status: 'active',
        paymentType: 'installment',
        totalAmount: 3500,
        paidAmount: 1200,
        discount: 0,
        assignedSchool: 1,
        documents: [],
        exams: [],
        communications: [],
        appointments: [],
        payments: []
      },
      {
        id: 2,
        firstName: 'Giulia',
        lastName: 'Bianchi',
        email: 'giulia.bianchi@email.com',
        phone: '+39 331 987 6543',
        codiceFiscale: 'BNCGLI92B15F205X',
        birthDate: '1992-02-15',
        birthPlace: 'Milano',
        address: 'Via Milano 456',
        city: 'Milano',
        province: 'MI',
        cap: '20100',
        course: 'Diploma Linguistico',
        courseId: 2,
        yearsToRecover: 1,
        enrollmentDate: '2024-02-01',
        status: 'active',
        paymentType: 'wire_transfer',
        totalAmount: 2800,
        paidAmount: 2800,
        discount: 200,
        assignedSchool: 2,
        documents: [],
        exams: [],
        communications: [],
        appointments: [],
        payments: []
      }
    ];

    const sampleSchools = [
      {
        id: 1,
        name: 'Istituto Tecnico Commerciale Roma',
        address: 'Via dei Commerci 10, Roma',
        phone: '+39 06 123 4567',
        email: 'info@itcroma.it',
        contact: 'Prof. Mario Verdi',
        notes: 'Scuola partner per esami tecnici',
        documents: [],
        examCalendar: [],
        assignedStudents: [1],
        examTemplates: []
      },
      {
        id: 2,
        name: 'Liceo Scientifico Milano',
        address: 'Via della Scienza 25, Milano',
        phone: '+39 02 987 6543',
        email: 'segreteria@liceomilano.it',
        contact: 'Prof.ssa Anna Neri',
        notes: 'Disponibile per esami scientifici',
        documents: [],
        examCalendar: [],
        assignedStudents: [2],
        examTemplates: []
      }
    ];

    const sampleCourses = [
      {
        id: 1,
        name: 'Diploma Scientifico',
        type: 'Liceo Scientifico',
        academicYear: '2023-2024',
        subjects: ['Matematica', 'Fisica', 'Chimica', 'Biologia', 'Italiano', 'Storia', 'Filosofia', 'Inglese'],
        price: 2800,
        notes: 'Corso completo per diploma scientifico'
      },
      {
        id: 2,
        name: 'Diploma Linguistico',
        type: 'Liceo Linguistico',
        academicYear: '2023-2024',
        subjects: ['Italiano', 'Inglese', 'Francese', 'Spagnolo', 'Storia', 'Geografia', 'Filosofia'],
        price: 2600,
        notes: 'Corso per diploma linguistico con tre lingue straniere'
      }
    ];

    const sampleLeads = [
      {
        id: 1,
        firstName: 'Andrea',
        lastName: 'Verdi',
        email: 'andrea.verdi@email.com',
        phone: '+39 340 111 2222',
        city: 'Napoli',
        studyPlan: 'Diploma Tecnico',
        yearsToRecover: 3,
        availableTime: 'Sera',
        status: 'new',
        source: 'Google Ads',
        createdAt: '2024-01-20',
        assignedTo: null,
        notes: '',
        communications: [],
        tasks: []
      },
      {
        id: 2,
        firstName: 'Francesca',
        lastName: 'Blu',
        email: 'francesca.blu@email.com',
        phone: '+39 349 333 4444',
        city: 'Torino',
        studyPlan: 'Diploma Classico',
        yearsToRecover: 2,
        availableTime: 'Mattina',
        status: 'contacted',
        source: 'Facebook',
        createdAt: '2024-01-22',
        assignedTo: 1,
        notes: 'Interessata, da ricontattare',
        communications: [],
        tasks: []
      }
    ];

    const sampleTasks = [
      {
        id: 1,
        title: 'Completare setup OpenAI',
        description: 'Configurare la chiave API per OpenAI',
        owner: 'Emanuele Marchiori',
        deadline: '2024-02-15',
        progress: 75,
        status: 'in_progress',
        createdAt: '2024-01-20'
      },
      {
        id: 2,
        title: 'Aggiornare template email',
        description: 'Rivedere e aggiornare i template email per i lead',
        owner: 'Anna Verdi',
        deadline: '2024-02-10',
        progress: 30,
        status: 'pending',
        createdAt: '2024-01-22'
      }
    ];

    // Only dispatch if arrays are empty (to avoid duplicates)
    if (state.students.length === 0) {
      sampleStudents.forEach(student => 
        dispatch({ type: 'ADD_STUDENT', payload: student })
      );
    }

    if (state.schools.length === 0) {
      sampleSchools.forEach(school => 
        dispatch({ type: 'ADD_SCHOOL', payload: school })
      );
    }

    if (state.courses.length === 0) {
      sampleCourses.forEach(course => 
        dispatch({ type: 'ADD_COURSE', payload: course })
      );
    }

    if (state.leads.length === 0) {
      sampleLeads.forEach(lead => 
        dispatch({ type: 'ADD_LEAD', payload: lead })
      );
    }

    if (state.tasks.length === 0) {
      sampleTasks.forEach(task => 
        dispatch({ type: 'ADD_TASK', payload: task })
      );
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch, logout, checkAuthStatus }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};