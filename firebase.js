import { initializeApp } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDf15-6xqLR32Hq4xXeW5hvfUTqPzi52Vs",
    authDomain: "mistery-duo.firebaseapp.com",
    databaseURL: "https://mistery-duo-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "mistery-duo",
    storageBucket: "mistery-duo.firebasestorage.app",
    messagingSenderId: "36695107825",
    appId: "1:36695107825:web:d92d202a3dd50c1f932150",
    measurementId: "G-P37CVN099B"
};

const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);
export const auth = getAuth(app);
