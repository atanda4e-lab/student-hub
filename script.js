import { initializeApp }
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    serverTimestamp,
    writeBatch
}
from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


/* ================= FIREBASE ================= */

const firebaseConfig = {
    apiKey: "AIzaSyBljAQH7ivAoHN9p4rv9axE64Y3iWzIBjA",
    authDomain: "kwasu-student-portal.firebaseapp.com",
    projectId: "kwasu-student-portal",
    storageBucket: "kwasu-student-portal.firebasestorage.app",
    messagingSenderId: "358033658086",
    appId: "1:358033658086:web:289f1dcda8e0cdcefb2b27"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


/* ================= CONSTANTS ================= */

const ADMIN_UID = "cTuQtaVn4YPiuzk3z9eEjQsbgNW2";
const ADMIN_EMAIL = "akimtayo43@gmail.com";

let currentUser = null;
let currentStudent = null;

let allCourses = [];
let currentRegistrationSemester = "First Semester";
let registeredCoursesCache = [];
let attendanceRows = [];


/* ================= DEPARTMENTS ================= */

const departments = [
"Computer Science",
"Information Technology",
"Software Engineering",
"Cyber Security",
"Information Systems",
"Data Science",
"Mathematics",
"Statistics",
"Physics",
"Chemistry",
"Biochemistry",
"Microbiology",
"Industrial Chemistry",
"Geology",
"Environmental Management",
"Biological Sciences",
"Plant Biology",
"Zoology",
"Economics",
"Accounting",
"Finance",
"Business Administration",
"Marketing",
"Entrepreneurship",
"Public Administration",
"Political Science",
"Mass Communication",
"Journalism",
"Library and Information Science",
"Sociology",
"Psychology",
"Criminology",
"Law",
"English",
"History",
"Religious Studies",
"Islamic Studies",
"Christian Religious Studies",
"Languages",
"Education",
"Educational Management",
"Guidance and Counselling",
"Health Education",
"Human Kinetics",
"Public Health",
"Nursing",
"Medicine",
"Architecture",
"Quantity Surveying",
"Estate Management",
"Urban and Regional Planning"
];


/* ================= COURSE TEMPLATES ================= */

const courseTemplates = [
"Introduction to {D}",
"Fundamentals of {D}",
"Principles of {D}",
"Basic Concepts in {D}",
"Academic Skills in {D}",
"Methods of {D}",
"Applied {D}",
"Intermediate {D}",
"Advanced {D}",
"Practical {D}",
"Research Methods in {D}",
"Professional Practice in {D}",
"Systems and Applications of {D}",
"Technology in {D}",
"Management of {D}",
"Current Issues in {D}",
"Project Development in {D}",
"Advanced Applications of {D}",
"Industrial Practice in {D}",
"Final Year Project in {D}"
];

const levelMap = [
"100","100","200","200","200","200","300","300","300","300",
"300","300","400","400","400","400","400","500","500","500"
];


/* ================= GENERAL COURSES ================= */

const generalCourses = [

["GST101","Use of English I","100",2],
["GST102","Nigerian Peoples and Culture","100",2],
["GST103","Introduction to Philosophy","100",2],
["GST104","Citizenship Education","100",2],
["GST105","Study Skills","100",2],

["GST201","Nigerian Peoples and Culture II","200",2],
["GST202","Use of English II","200",2],
["GST203","Peace and Conflict Resolution","300",2],
["GST204","Entrepreneurship and Innovation","300",2],
["GST301","Communication Skills","300",2],
["GST302","Leadership and Citizenship","400",2],
["GST401","Contemporary National Issues","400",2],
["GST402","Research and Academic Writing","500",2],

["VTE201","Introduction to Venture Creation","200",2],
["VTE202","Business Opportunity Identification","200",2],
["VTE301","Enterprise Resource Planning","300",3],
["VTE302","Business Management and Innovation","300",2],
["VTE401","Small Business Management","400",3],
["VTE402","Entrepreneurial Finance","400",3],
["VTE501","Venture Development Project","500",3]

];


/* ================= DOM HELPER ================= */

function $(id){
    return document.getElementById(id);
}


/* ================= MESSAGE ================= */

function message(element,text,error=false){

    const el=$(element);

    if(!el) return;

    el.innerHTML =
        `<div class="message ${error ? "error" : ""}">${text}</div>`;
}


/* ================= PAGE SWITCHING ================= */

window.showLanding=function(){

    hideAllPages();
    $("landingPage").classList.remove("hidden");

};

window.showStudentLogin=function(){

    hideAllPages();
    $("studentLoginPage").classList.remove("hidden");

};

window.showStudentRegister=function(){

    hideAllPages();
    $("studentRegisterPage").classList.remove("hidden");

    populateDepartmentSelect();

};

window.showAdminLogin=function(){

    hideAllPages();
    $("adminLoginPage").classList.remove("hidden");

};


function hideAllPages(){

    [
        "landingPage",
        "studentLoginPage",
        "studentRegisterPage",
        "adminLoginPage",
        "studentApp",
        "adminApp"
    ].forEach(id=>{
        $(id).classList.add("hidden");
    });

}


/* ================= DEPARTMENT SELECT ================= */

function populateDepartmentSelect(){

    const select=$("regDepartment");

    if(select.options.length>1) return;

    departments.forEach(dept=>{

        const option=document.createElement("option");

        option.value=dept;
        option.textContent=dept;

        select.appendChild(option);

    });

}


/* ================= STUDENT REGISTRATION ================= */

$("studentRegisterForm").addEventListener("submit",async e=>{

    e.preventDefault();

    const name=$("regName").value.trim();
    const phone=$("regPhone").value.trim();
    const email=$("regEmail").value.trim();
    const department=$("regDepartment").value;
    const level=$("regLevel").value;
    const password=$("regPassword").value;
    const confirm=$("regConfirm").value;

    if(password!==confirm){

        message(
            "registrationMessage",
            "Passwords do not match.",
            true
        );

        return;
    }

    try{

        message(
            "registrationMessage",
            "Creating your account..."
        );

        const credential =
            await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

        const uid=credential.user.uid;

        await setDoc(
            doc(db,"students",uid),
            {
                uid,
                name,
                phone,
                email,
                department,
                level,
                status:"pending",
                matricNumber:"",
                createdAt:serverTimestamp()
            }
        );

        await signOut(auth);

        $("regName").value="";
        $("regPhone").value="";
        $("regEmail").value="";
        $("regPassword").value="";
        $("regConfirm").value="";

        showStudentLogin();

        message(
            "studentLoginMessage",
            "Registration successful. Your account is waiting for administrator approval."
        );

    }catch(error){

        message(
            "registrationMessage",
            error.message,
            true
        );

    }

});


/* ================= STUDENT LOGIN ================= */

$("studentLoginForm").addEventListener("submit",async e=>{

    e.preventDefault();

    const email=$("studentLoginEmail").value.trim();
    const password=$("studentLoginPassword").value;

    try{

        message(
            "studentLoginMessage",
            "Logging in..."
        );

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        const user=credential.user;

        if(user.uid===ADMIN_UID || user.email===ADMIN_EMAIL){

            await loadAdmin();

            return;
        }

        const studentSnap =
            await getDoc(doc(db,"students",user.uid));

        if(!studentSnap.exists()){

            await signOut(auth);

            message(
                "studentLoginMessage",
                "Student profile was not found.",
                true
            );

            return;
        }

        const student=studentSnap.data();

        if(student.status==="pending"){

            await signOut(auth);

            message(
                "studentLoginMessage",
                "Your account is still waiting for administrator approval.",
                true
            );

            return;
        }

        if(student.status==="rejected"){

            await signOut(auth);

            message(
                "studentLoginMessage",
                "Your registration has been rejected. Please contact the administrator.",
                true
            );

            return;
        }

        currentStudent=student;

        await loadStudent();

    }catch(error){

        message(
            "studentLoginMessage",
            error.message,
            true
        );

    }

});


/* ================= ADMIN LOGIN ================= */

$("adminLoginForm").addEventListener("submit",async e=>{

    e.preventDefault();

    const email=$("adminEmail").value.trim();
    const password=$("adminPassword").value;

    try{

        message(
            "adminLoginMessage",
            "Logging in..."
        );

        const credential =
            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

        if(
            credential.user.uid!==ADMIN_UID &&
            credential.user.email!==ADMIN_EMAIL
        ){

            await signOut(auth);

            message(
                "adminLoginMessage",
                "This account is not authorized as an administrator.",
                true
            );

            return;
        }

        await loadAdmin();

    }catch(error){

        message(
            "adminLoginMessage",
            error.message,
            true
        );

    }

});


/* ================= AUTH STATE ================= */

onAuthStateChanged(auth,user=>{

    currentUser=user;

});


/* ================= STUDENT LOAD ================= */

async function loadStudent(){

    hideAllPages();

    $("studentApp").classList.remove("hidden");

    $("studentTopName").textContent=currentStudent.name;
    $("welcomeName").textContent=currentStudent.name;

    $("registrationLevel").value=currentStudent.level;

    fillStudentProfile();

    await loadCourses();

    await loadStudentRegistration();

    await loadStudentResults();

    await loadStudentAttendance();

    await loadStudentAnnouncements();
    await loadStudentNotifications();
    await loadStudentCalendar();
    await loadRegistrationSlip();
    await loadStudentTranscript();

    await updateStudentDashboard();

}


/* ================= PROFILE ================= */

function fillStudentProfile(){
    $("profileName").textContent=currentStudent.name;
    $("profileEmail").textContent=currentStudent.email;
    $("profilePhone").textContent=currentStudent.phone || "-";
    $("profileDepartment").textContent=currentStudent.department;
    $("profileLevel").textContent=currentStudent.level + " Level";
    $("profileStatus").textContent=currentStudent.status;
    $("profileMatric").textContent=currentStudent.matricNumber || "Not assigned";
    if($("editProfileName")){ $("editProfileName").value=currentStudent.name || ""; $("editProfilePhone").value=currentStudent.phone || ""; }
    if($("dashMatric")) $("dashMatric").textContent=currentStudent.matricNumber || "Not assigned";
}


/* ================= STUDENT NAVIGATION ================= */

window.studentSection=function(id,button){

    document.querySelectorAll("#studentApp .section")
        .forEach(section=>section.classList.remove("active"));

    $(id).classList.add("active");

    document.querySelectorAll("#studentApp .nav-btn")
        .forEach(btn=>btn.classList.remove("active"));

    if(button){
        button.classList.add("active");
    }
    if(id==="registrationSlip") loadRegistrationSlip();
    if(id==="studentTranscript") loadStudentTranscript();
    if(id==="studentNotifications") loadStudentNotifications();
    if(id==="studentCalendar") loadStudentCalendar();

};


/* ================= ADMIN NAVIGATION ================= */

window.adminSection=function(id,button){

    document.querySelectorAll("#adminApp .section")
        .forEach(section=>section.classList.remove("active"));

    $(id).classList.add("active");

    document.querySelectorAll("#adminApp .nav-btn")
        .forEach(btn=>btn.classList.remove("active"));

    if(button){
        button.classList.add("active");
    }

    if(id==="pendingStudents") loadPendingStudents();
    if(id==="allStudents") loadAllStudents();
    if(id==="adminCourses") loadAdminCourses();
    if(id==="adminResults"){
        loadResultStudents();
        loadAdminResults();
    }
    if(id==="adminAttendance") loadAttendanceCourses();
    if(id==="adminAnnouncements") loadAdminAnnouncements();
    if(id==="adminStudentSearch") loadStudentSearchData();
    if(id==="adminCalendar") loadAdminCalendar();

};


/* ================= LOAD COURSES ================= */

async function loadCourses(){

    const snap=await getDocs(collection(db,"courses"));

    allCourses=snap.docs.map(d=>({
        id:d.id,
        ...d.data()
    }));

    if(allCourses.length===0){

        await seedCourses();

        const snap2=await getDocs(collection(db,"courses"));

        allCourses=snap2.docs.map(d=>({
            id:d.id,
            ...d.data()
        }));

    }

}


/* ================= GENERATE COURSES ================= */

async function seedCourses(){

    try{

        let count=0;

        for(let d=0;d<departments.length;d++){

            const department=departments[d];

            for(let i=0;i<courseTemplates.length;i++){

                const level=levelMap[i];

                const codePrefix =
                    department
                    .split(" ")
                    .map(word=>word[0])
                    .join("")
                    .substring(0,4)
                    .toUpperCase();

                const code =
                    `${codePrefix}${level}${String(i+1).padStart(2,"0")}`;

                const title=
                    courseTemplates[i].replace("{D}",department);

                const courseId=
                    `${department}_${level}_${i+1}`
                    .replace(/[^a-zA-Z0-9]/g,"_");

                await setDoc(
                    doc(db,"courses",courseId),
                    {
                        code,
                        title,
                        department,
                        level,
                        unit:i>=16 ? 3 : 2,
                        type:"departmental"
                    },
                    {merge:true}
                );

                count++;

            }

        }


        for(const course of generalCourses){

            const [code,title,level,unit]=course;

            const courseId=`general_${code}`;

            await setDoc(
                doc(db,"courses",courseId),
                {
                    code,
                    title,
                    department:"All Departments",
                    level,
                    unit,
                    type:"general"
                },
                {merge:true}
            );

        }

        message(
            "courseSeedMessage",
            `Courses generated successfully. ${count} departmental course records were processed.`
        );

        await loadCourses();

    }catch(error){

        message(
            "courseSeedMessage",
            error.message,
            true
        );

    }

}


/* ================= REGISTRATION SEMESTER ================= */

window.changeRegistrationSemester=function(semester){

    currentRegistrationSemester=semester;

    $("firstSemBtn").classList.toggle(
        "active",
        semester==="First Semester"
    );

    $("secondSemBtn").classList.toggle(
        "active",
        semester==="Second Semester"
    );

    $("registrationSemesterTitle").textContent=
        `${semester} Courses`;

    loadStudentRegistration();

};


/* ================= LOAD STUDENT REGISTRATION ================= */

async function loadStudentRegistration(){

    if(!currentUser) return;

    try{

        const q=query(
            collection(db,"registrations"),
            where("studentUid","==",currentUser.uid),
            where("semester","==",currentRegistrationSemester)
        );

        const snap=await getDocs(q);

        registeredCoursesCache=snap.docs.map(d=>({
            id:d.id,
            ...d.data()
        }));

        renderRegistrationCourses();

    }catch(error){

        /*
        Fallback if Firestore index is not yet available.
        */

        const q2=query(
            collection(db,"registrations"),
            where("studentUid","==",currentUser.uid)
        );

        const snap=await getDocs(q2);

        registeredCoursesCache=
            snap.docs
            .map(d=>({
                id:d.id,
                ...d.data()
            }))
            .filter(r=>
                r.semester===currentRegistrationSemester
            );

        renderRegistrationCourses();

    }

}


/* ================= AVAILABLE COURSES ================= */

function getAvailableCoursesForStudent(){
    const level=String(currentStudent.level);
    return allCourses.filter(course=>String(course.level)===level && course.semester===currentRegistrationSemester && (course.department===currentStudent.department || course.department==="All Departments")).sort((a,b)=>String(a.code).localeCompare(String(b.code)));
}


/* ================= RENDER REGISTRATION ================= */

function renderRegistrationCourses(){

    const container=$("courseRegistrationList");

    container.innerHTML="";

    const available=
        getAvailableCoursesForStudent();

    if(available.length===0){

        container.innerHTML=
            `<p>No courses available for your department and level.</p>`;

        return;
    }


    const registeredIds=
        new Set(
            registeredCoursesCache.map(
                registration=>registration.courseId
            )
        );


    available.forEach(course=>{

        const checked=
            registeredIds.has(course.id)
                ? "checked"
                : "";

        const div=document.createElement("div");

        div.className="course-item";

        div.innerHTML=`

            <input
                type="checkbox"
                class="registration-checkbox"
                value="${course.id}"
                ${checked}
            >

            <div class="course-info">

                <div class="course-code">
                    ${course.code}
                </div>

                <div class="course-title">
                    ${course.title}
                </div>

                <div class="course-meta">
                    ${course.level} Level • ${course.unit} Unit • ${course.department}
                </div>

            </div>

        `;

        container.appendChild(div);

    });


    updateRegistrationSummary();

    document
        .querySelectorAll(".registration-checkbox")
        .forEach(box=>{
            box.addEventListener(
                "change",
                updateRegistrationSummary
            );
        });

}


/* ================= REGISTRATION SUMMARY ================= */

function updateRegistrationSummary(){

    const selected=
        document.querySelectorAll(
            ".registration-checkbox:checked"
        ).length;

    $("registrationSummary").textContent=
        `${selected} course${selected===1?"":"s"} selected`;

}


/* ================= SAVE REGISTRATION ================= */

window.saveCourseRegistration=async function(){

    if(!currentUser || !currentStudent){

        message(
            "registrationSaveMessage",
            "You must be logged in.",
            true
        );

        return;
    }

    const selected=
        [...document.querySelectorAll(
            ".registration-checkbox:checked"
        )].map(box=>box.value);


    if(selected.length===0){

        message(
            "registrationSaveMessage",
            "Please select at least one course.",
            true
        );

        return;
    }


    try{

        const session=
            $("registrationSession").value.trim();

        const level=
            currentStudent.level;


        /*
        First remove old registrations for this semester.
        */

        const oldQuery=query(
            collection(db,"registrations"),
            where("studentUid","==",currentUser.uid)
        );

        const oldSnap=await getDocs(oldQuery);

        for(const item of oldSnap.docs){

            if(item.data().semester===currentRegistrationSemester){

                await deleteDoc(item.ref);

            }

        }


        /*
        Save only the courses selected by the student.
        */

        for(const courseId of selected){

            const course=
                allCourses.find(c=>c.id===courseId);

            if(!course) continue;

            await addDoc(
                collection(db,"registrations"),
                {
                    studentUid:currentUser.uid,
                    studentName:currentStudent.name,
                    courseId:course.id,
                    courseCode:course.code,
                    courseTitle:course.title,
                    department:course.department,
                    level,
                    unit:course.unit || 2,
                    semester:currentRegistrationSemester,
                    session,
                    createdAt:serverTimestamp()
                }
            );

        }


        message(
            "registrationSaveMessage",
            `${selected.length} course(s) registered successfully for ${currentRegistrationSemester}.`
        );

        await loadStudentRegistration();

        await updateStudentDashboard();

    }catch(error){

        message(
            "registrationSaveMessage",
            error.message,
            true
        );

    }

};


/* ================= GRADE ================= */

function getGrade(score){

    if(score>=70) return "A";
    if(score>=60) return "B";
    if(score>=50) return "C";
    if(score>=45) return "D";
    if(score>=40) return "E";

    return "F";

}


/* ================= GRADE POINT ================= */

function getGradePoint(grade){

    const points={
        A:5,
        B:4,
        C:3,
        D:2,
        E:1,
        F:0
    };

    return points[grade] ?? 0;

}


/* ================= GPA CALCULATOR ================= */

function calculateGPA(results){

    if(!results.length) return 0;

    let totalQualityPoints=0;
    let totalUnits=0;

    results.forEach(result=>{

        const unit=Number(result.unit || 0);
        const gp=Number(
            result.gradePoint ??
            getGradePoint(result.grade)
        );

        totalQualityPoints += unit * gp;
        totalUnits += unit;

    });

    if(totalUnits===0) return 0;

    return totalQualityPoints/totalUnits;

}


/* ================= CGPA CALCULATOR ================= */

function calculateCGPA(results){

    if(!results.length) return 0;

    let qualityPoints=0;
    let units=0;

    results.forEach(result=>{

        const unit=Number(result.unit || 0);

        const gp=Number(
            result.gradePoint ??
            getGradePoint(result.grade)
        );

        qualityPoints += unit * gp;
        units += unit;

    });

    if(units===0) return 0;

    return qualityPoints/units;

}


/* ================= LOAD STUDENT RESULTS ================= */

async function loadStudentResults(){

    if(!currentUser) return;

    try{

        const q=query(
            collection(db,"results"),
            where("studentUid","==",currentUser.uid)
        );

        const snap=await getDocs(q);

        const results=
            snap.docs.map(d=>({
                id:d.id,
                ...d.data()
            }));


        const first=
            results.filter(
                r=>r.semester==="First Semester"
            );

        const second=
            results.filter(
                r=>r.semester==="Second Semester"
            );


        const firstGPA=calculateGPA(first);
        const secondGPA=calculateGPA(second);
        const cgpa=calculateCGPA(results);


        $("firstSemesterGPA").textContent=
            firstGPA.toFixed(2);

        $("secondSemesterGPA").textContent=
            secondGPA.toFixed(2);

        $("overallCGPA").textContent=
            cgpa.toFixed(2);


        const body=$("studentResultsBody");

        body.innerHTML="";


        if(results.length===0){

            body.innerHTML=
                `<tr><td colspan="8">No results available yet.</td></tr>`;

            return;
        }


        results.sort((a,b)=>
            String(a.semester).localeCompare(String(b.semester))
        );


        results.forEach(result=>{

            const tr=document.createElement("tr");

            tr.innerHTML=`

                <td>${result.semester || "-"}</td>

                <td>
                    <strong>${result.courseCode || ""}</strong><br>
                    ${result.courseTitle || ""}
                </td>

                <td>${result.unit || "-"}</td>

                <td>${result.ca ?? "-"}</td>

                <td>${result.exam ?? "-"}</td>

                <td><strong>${result.total ?? result.score ?? "-"}</strong></td>

                <td>${result.grade || "-"}</td>

                <td>${result.gradePoint ?? getGradePoint(result.grade)}</td>

            `;

            body.appendChild(tr);

        });


    }catch(error){

        console.error(error);

    }

}


/* ================= DASHBOARD ================= */

async function updateStudentDashboard(){
    if(!currentUser)return;
    const [regSnap,resultSnap]=await Promise.all([getDocs(query(collection(db,"registrations"),where("studentUid","==",currentUser.uid))),getDocs(query(collection(db,"results"),where("studentUid","==",currentUser.uid)))]);
    const registrations=regSnap.docs.map(d=>d.data()),results=resultSnap.docs.map(d=>d.data());
    const cgpa=calculateCGPA(results),second=results.filter(r=>r.semester==="Second Semester"),first=results.filter(r=>r.semester==="First Semester"),currentGPA=second.length?calculateGPA(second):first.length?calculateGPA(first):0,units=registrations.reduce((s,r)=>s+Number(r.unit||0),0);
    let standing="-"; if(results.length) standing=cgpa>=4.5?"First Class":cgpa>=3.5?"Second Class Upper":cgpa>=2.4?"Second Class Lower":cgpa>=1.5?"Third Class":"Academic Warning";
    $("dashCourses").textContent=registrations.length;$("dashResults").textContent=results.length;$("dashGPA").textContent=currentGPA.toFixed(2);$("dashCGPA").textContent=cgpa.toFixed(2);
    if($("dashMatric"))$("dashMatric").textContent=currentStudent.matricNumber||"Not assigned";if($("dashUnits"))$("dashUnits").textContent=units;if($("dashStanding"))$("dashStanding").textContent=standing;if($("dashNotifications"))$("dashNotifications").textContent=await countStudentNotifications();
}


/* ================= STUDENT ATTENDANCE ================= */

async function loadStudentAttendance(){

    if(!currentUser) return;

    try{

        const q=query(
            collection(db,"attendance"),
            where("studentUid","==",currentUser.uid)
        );

        const snap=await getDocs(q);

        const records=
            snap.docs.map(d=>d.data());

        const body=$("studentAttendanceBody");

        body.innerHTML="";

        if(records.length===0){

            body.innerHTML=
                `<tr><td colspan="3">No attendance records yet.</td></tr>`;

            return;
        }


        records.sort((a,b)=>
            String(b.date).localeCompare(String(a.date))
        );


        records.forEach(record=>{

            const tr=document.createElement("tr");

            tr.innerHTML=`

                <td>${record.date || "-"}</td>

                <td>
                    <strong>${record.courseCode || ""}</strong><br>
                    ${record.courseTitle || ""}
                </td>

                <td>
                    <span class="badge ${
                        record.status==="Present"
                        ? "approved"
                        : "rejected"
                    }">
                        ${record.status}
                    </span>
                </td>

            `;

            body.appendChild(tr);

        });

    }catch(error){

        console.error(error);

    }

}


/* ================= STUDENT ANNOUNCEMENTS ================= */

async function loadStudentAnnouncements(){

    try{

        const snap=
            await getDocs(
                collection(db,"announcements")
            );

        const list=$("studentAnnouncementsList");

        list.innerHTML="";

        snap.docs.forEach(d=>{

            const data=d.data();

            const div=document.createElement("div");

            div.className="card";

            div.innerHTML=`

                <h3>${data.title || "Announcement"}</h3>

                <p>${data.message || ""}</p>

                <small>
                    ${data.createdAt?.toDate
                        ? data.createdAt.toDate().toLocaleString()
                        : ""}
                </small>

            `;

            list.appendChild(div);

        });

    }catch(error){

        console.error(error);

    }

}


/* ================= ADMIN LOAD ================= */

async function loadAdmin(){

    hideAllPages();

    $("adminApp").classList.remove("hidden");

    await loadCourses();

    await updateAdminDashboard();

    await loadPendingStudents();

    await loadAllStudents();

    await loadAdminCourses();

    await loadResultStudents();

    await loadAdminResults();

    await loadAttendanceCourses();

    await loadAdminAnnouncements();

}


/* ================= ADMIN DASHBOARD ================= */

async function updateAdminDashboard(){
    const [studentsSnap, coursesSnap, resultsSnap] = await Promise.all([
        getDocs(collection(db,"students")),
        getDocs(collection(db,"courses")),
        getDocs(collection(db,"results"))
    ]);

    const students = studentsSnap.docs.map(d => d.data());
    const counts = { pending: 0, approved: 0, rejected: 0 };
    const levels = { "100": 0, "200": 0, "300": 0, "400": 0, "500": 0 };

    students.forEach(student => {
        const status = String(student.status || "pending").toLowerCase();
        if (Object.prototype.hasOwnProperty.call(counts, status)) counts[status]++;
        const level = String(student.level || "").replace(/[^0-9]/g, "");
        if (Object.prototype.hasOwnProperty.call(levels, level)) levels[level]++;
    });

    $("adminTotalStudents").textContent = studentsSnap.size;
    $("adminPendingStudents").textContent = counts.pending;
    $("adminTotalCourses").textContent = coursesSnap.size;
    $("adminTotalResults").textContent = resultsSnap.size;
    if ($("adminApprovedStudents")) $("adminApprovedStudents").textContent = counts.approved;
    if ($("adminRejectedStudents")) $("adminRejectedStudents").textContent = counts.rejected;
    if ($("adminStatusApproved")) $("adminStatusApproved").textContent = counts.approved;
    if ($("adminStatusPending")) $("adminStatusPending").textContent = counts.pending;
    if ($("adminStatusRejected")) $("adminStatusRejected").textContent = counts.rejected;

    const levelBox = $("adminLevelBreakdown");
    if (levelBox) {
        const maxCount = Math.max(1, ...Object.values(levels));
        levelBox.innerHTML = Object.entries(levels).map(([level, count]) => `
            <div class="level-row">
                <span>${level} Level</span>
                <div class="level-track"><div class="level-fill" style="width:${Math.round((count / maxCount) * 100)}%"></div></div>
                <strong>${count}</strong>
            </div>
        `).join("");
    }
    const dateBox = $("adminDashboardDate");
    if (dateBox) dateBox.textContent = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}


/* ================= PENDING STUDENTS ================= */

async function loadPendingStudents() {
    const body = $("pendingStudentsBody");

    if (!body) {
        return;
    }

    body.innerHTML = '<tr><td colspan="5">Loading pending registrations...</td></tr>';

    try {
        const studentsSnapshot = await getDocs(collection(db, "students"));
        const pendingStudents = studentsSnapshot.docs
            .map((studentDocument) => ({
                id: studentDocument.id,
                ...studentDocument.data()
            }))
            .filter((student) => student.status === "pending");

        body.innerHTML = "";

        if (pendingStudents.length === 0) {
            body.innerHTML = '<tr><td colspan="5">There are no pending registrations.</td></tr>';
            return;
        }

        pendingStudents.forEach((student) => {
            const studentId = student.uid || student.id;
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${student.name || "-"}</td>
                <td>${student.email || "-"}</td>
                <td>${student.department || "Not assigned"}</td>
                <td>${student.level || "Not assigned"}</td>
                <td>
                    <button
                        class="primary"
                        type="button"
                        onclick="approveStudent('${studentId}')">
                        Approve
                    </button>

                    <button
                        class="logout"
                        type="button"
                        onclick="rejectStudent('${studentId}')">
                        Reject
                    </button>
                </td>
            `;

            body.appendChild(row);
        });
    } catch (error) {
        console.error("Could not load pending students:", error);
        body.innerHTML = '<tr><td colspan="5">Could not load registrations. Check your Firebase permissions.</td></tr>';
    }
}


/* ================= APPROVE STUDENT ================= */

window.approveStudent = async function (studentId) {
    const confirmed = confirm("Approve this student's registration?");

    if (!confirmed) {
        return;
    }

    try {
        await updateDoc(doc(db, "students", studentId), {
            status: "approved",
            approvedAt: serverTimestamp()
        });

        const matricNumber = await generateMatricNumber(studentId);

        await loadPendingStudents();
        await loadAllStudents();
        await updateAdminDashboard();

        alert(
            matricNumber
                ? `Student approved. Matric number: ${matricNumber}`
                : "Student approved successfully. You can assign a matric number from All Students."
        );
    } catch (error) {
        console.error("Could not approve student:", error);
        alert("The student could not be approved. Check your connection and Firebase permissions.");
    }
};


/* ================= REJECT STUDENT ================= */

window.rejectStudent = async function (studentId) {
    const confirmed = confirm("Are you sure you want to reject this registration?");

    if (!confirmed) {
        return;
    }

    try {
        await updateDoc(doc(db, "students", studentId), {
            status: "rejected",
            rejectedAt: serverTimestamp()
        });

        await loadPendingStudents();
        await loadAllStudents();
        await updateAdminDashboard();

        alert("Student registration rejected.");
    } catch (error) {
        console.error("Could not reject student:", error);
        alert("The registration could not be rejected. Check your connection and Firebase permissions.");
    }
};


/* ================= ALL STUDENTS ================= */

let adminStudentsCache = [];

async function loadAllStudents() {
    const body = $("allStudentsBody");

    if (body) {
        body.innerHTML = '<tr><td colspan="7">Loading students...</td></tr>';
    }

    try {
        const studentsSnapshot = await getDocs(collection(db, "students"));

        adminStudentsCache = studentsSnapshot.docs.map((studentDocument) => ({
            id: studentDocument.id,
            ...studentDocument.data()
        }));

        const departmentSelect = $("studentDepartmentFilter");

        if (departmentSelect) {
            const selectedDepartment = departmentSelect.value;
            departmentSelect.innerHTML = '<option value="">All Departments</option>';

            departments.forEach((department) => {
                const option = document.createElement("option");
                option.value = department;
                option.textContent = department;
                departmentSelect.appendChild(option);
            });

            departmentSelect.value = selectedDepartment;
        }

        renderAdminStudents();
    } catch (error) {
        console.error("Could not load all students:", error);

        if (body) {
            body.innerHTML = '<tr><td colspan="7">Could not load students. Check your Firebase permissions.</td></tr>';
        }
    }
}


function renderAdminStudents() {
    const body = $("allStudentsBody");

    if (!body) {
        return;
    }

    const searchText = ($("studentSearchInput")?.value || "").toLowerCase().trim();
    const selectedDepartment = $("studentDepartmentFilter")?.value || "";
    const selectedLevel = $("studentLevelFilter")?.value || "";
    const selectedStatus = $("studentStatusFilter")?.value || "";

    const filteredStudents = adminStudentsCache.filter((student) => {
        const searchableText = [
            student.name,
            student.email,
            student.matricNumber,
            student.department
        ].join(" ").toLowerCase();

        const matchesSearch = !searchText || searchableText.includes(searchText);
        const matchesDepartment = !selectedDepartment || student.department === selectedDepartment;
        const matchesLevel = !selectedLevel || String(student.level) === selectedLevel;
        const matchesStatus = !selectedStatus || student.status === selectedStatus;

        return matchesSearch && matchesDepartment && matchesLevel && matchesStatus;
    });

    body.innerHTML = "";

    if (filteredStudents.length === 0) {
        body.innerHTML = '<tr><td colspan="7">No students found.</td></tr>';
        return;
    }

    filteredStudents.forEach((student) => {
        const studentId = student.uid || student.id;
        const status = student.status || "pending";
        const statusClass = status === "approved"
            ? "approved"
            : status === "pending"
                ? "pending"
                : "rejected";

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${student.name || "-"}</td>
            <td class="matric">${student.matricNumber || "Not assigned"}</td>
            <td>${student.email || "-"}</td>
            <td>${student.department || "-"}</td>
            <td>${student.level || "-"}</td>
            <td><span class="badge ${statusClass}">${status}</span></td>
            <td>
                <button
                    class="secondary"
                    type="button"
                    onclick="editStudentDetails('${studentId}')">
                    Edit Details
                </button>
                ${status === "approved" ? `
                    <button
                        class="secondary"
                        type="button"
                        onclick="assignMatric('${studentId}')">
                        Assign Matric
                    </button>
                ` : ""}
            </td>
        `;

        body.appendChild(row);
    });
}


/* ================= SEARCH AND FILTER ================= */

window.filterAdminStudents = function () {
    renderAdminStudents();
};


/* ================= EDIT DEPARTMENT AND LEVEL ================= */

window.editStudentDetails = async function (studentId) {
    const student = adminStudentsCache.find((item) => (item.uid || item.id) === studentId);

    if (!student) {
        alert("Student record could not be found.");
        return;
    }

    const departmentInput = prompt(
        `Enter the student's department.\nAvailable departments: ${departments.join(", ")}`,
        student.department || ""
    );

    if (departmentInput === null) {
        return;
    }

    const department = departmentInput.trim();

    if (!department) {
        alert("Department cannot be empty.");
        return;
    }

    const levelInput = prompt(
        "Enter the student's level: 100, 200, 300, 400, or 500",
        String(student.level || "100")
    );

    if (levelInput === null) {
        return;
    }

    const level = Number(levelInput.trim());
    const allowedLevels = [100, 200, 300, 400, 500];

    if (!allowedLevels.includes(level)) {
        alert("Please enter 100, 200, 300, 400, or 500.");
        return;
    }

    try {
        await updateDoc(doc(db, "students", studentId), {
            department,
            level,
            updatedAt: serverTimestamp()
        });

        await loadAllStudents();
        await updateAdminDashboard();

        alert("Student department and level have been updated.");
    } catch (error) {
        console.error("Could not update student details:", error);
        alert("Student details could not be updated. Check your Firebase permissions.");
    }
};


/* ================= ASSIGN MATRIC NUMBER ================= */

window.assignMatric = async function (studentId) {
    const student = adminStudentsCache.find((item) => (item.uid || item.id) === studentId);

    if (!student) {
        alert("Student record could not be found.");
        return;
    }

    const matricInput = prompt(
        `Enter the matric number for ${student.name || "this student"}:`,
        student.matricNumber || ""
    );

    if (matricInput === null) {
        return;
    }

    const matricNumber = matricInput.trim();

    if (!matricNumber) {
        alert("Matric number cannot be empty.");
        return;
    }

    try {
        await updateDoc(doc(db, "students", studentId), {
            matricNumber,
            matricAssignedAt: serverTimestamp()
        });

        await loadAllStudents();
        await updateAdminDashboard();

        alert("Matric number saved successfully.");
    } catch (error) {
        console.error("Could not assign matric number:", error);
        alert("Matric number could not be saved. Check your Firebase permissions.");
    }
};


/* ================= GENERATE MATRIC NUMBER ================= */

async function generateMatricNumber(studentId) {
    const studentsSnapshot = await getDocs(collection(db, "students"));
    const studentDocument = studentsSnapshot.docs.find((item) => item.id === studentId);

    if (!studentDocument) {
        return "";
    }

    const student = studentDocument.data();

    if (student.matricNumber) {
        return student.matricNumber;
    }

    const registrationDate = student.createdAt && student.createdAt.toDate
        ? student.createdAt.toDate()
        : new Date();
    const year = String(registrationDate.getFullYear()).slice(-2);
    const departmentName = student.department || "Student";
    const departmentPrefix = departmentName
        .split(/\s+/)
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .substring(0, 4)
        .toUpperCase();

    const matricPattern = new RegExp("^" + year + "/" + departmentPrefix + "/(\\d+)$");
    let highestNumber = 0;

    studentsSnapshot.docs.forEach((document) => {
        const existingStudent = document.data();
        const existingMatric = String(existingStudent.matricNumber || "");
        const match = existingMatric.match(matricPattern);

        if (match) {
            highestNumber = Math.max(highestNumber, Number(match[1]));
        }
    });

    const matricNumber = `${year}/${departmentPrefix}/${String(highestNumber + 1).padStart(4, "0")}`;

    await updateDoc(doc(db, "students", studentId), {
        matricNumber,
        matricAssignedAt: serverTimestamp()
    });

    return matricNumber;
}


/* ================= ADMIN COURSES ================= */

async function loadAdminCourses(){

    const body=$("adminCoursesBody");

    body.innerHTML="";

    allCourses
        .slice(0,300)
        .forEach(course=>{

            const tr=document.createElement("tr");

            tr.innerHTML=`

                <td>${course.code}</td>

                <td>${course.title}</td>

                <td>${course.department}</td>

                <td>${course.level}</td>

                <td>${course.semester || "-"}</td>

                <td>${course.unit}</td>

            `;

            body.appendChild(tr);

        });

}


/* ================= RESULT STUDENTS ================= */

async function loadResultStudents(){

    const snap=
        await getDocs(
            collection(db,"students")
        );

    const select=$("resultStudent");

    select.innerHTML=
        `<option value="">Select Student</option>`;

    snap.docs.forEach(d=>{

        const student=d.data();

        if(student.status!=="approved") return;

        const option=document.createElement("option");

        option.value=student.uid;

        option.textContent=
            `${student.name} — ${student.matricNumber || "No matric"} — ${student.email}`;

        select.appendChild(option);

    });

}


/* ================= LOAD REGISTERED RESULT COURSES ================= */

window.loadResultCourses=async function(){

    const studentUid=$("resultStudent").value;
    const semester=$("resultSemester").value;

    const select=$("resultCourse");

    select.innerHTML=
        `<option value="">Loading registered courses...</option>`;

    $("resultPreview").textContent=
        "Only courses registered by this student will appear here.";


    if(!studentUid){

        select.innerHTML=
            `<option value="">Select Student first</option>`;

        return;
    }


    try{

        const q=query(
            collection(db,"registrations"),
            where("studentUid","==",studentUid)
        );

        const snap=await getDocs(q);

        const registrations=
            snap.docs
            .map(d=>({
                id:d.id,
                ...d.data()
            }))
            .filter(r=>
                r.semester===semester
            );


        select.innerHTML=
            `<option value="">Select registered course</option>`;


        if(registrations.length===0){

            select.innerHTML=
                `<option value="">No registered courses for this semester</option>`;

            $("resultPreview").textContent=
                `This student has not registered any course for ${semester}. No result can be uploaded.`;

            return;
        }


        registrations.forEach(registration=>{

            const option=document.createElement("option");

            option.value=registration.courseId;

            option.textContent=
                `${registration.courseCode} — ${registration.courseTitle} (${registration.unit} Unit)`;

            select.appendChild(option);

        });


        $("resultPreview").textContent=
            `${registrations.length} registered course(s) found for ${semester}.`;

    }catch(error){

        select.innerHTML=
            `<option value="">Unable to load courses</option>`;

        message(
            "resultMessage",
            error.message,
            true
        );

    }

};


/* ================= UPLOAD RESULT ================= */

window.uploadResult=async function(){

    const studentUid=$("resultStudent").value;
    const semester=$("resultSemester").value;
    const courseId=$("resultCourse").value;

    const ca=Number($("resultCA").value);
    const exam=Number($("resultExam").value);

    const session=$("resultSession").value.trim();


    if(!studentUid){

        message(
            "resultMessage",
            "Select a student.",
            true
        );

        return;
    }


    if(!courseId){

        message(
            "resultMessage",
            "No course selected. Only registered courses can receive results.",
            true
        );

        return;
    }


    if(
        Number.isNaN(ca) ||
        ca<0 ||
        ca>30
    ){

        message(
            "resultMessage",
            "CA must be between 0 and 30.",
            true
        );

        return;
    }


    if(
        Number.isNaN(exam) ||
        exam<0 ||
        exam>70
    ){

        message(
            "resultMessage",
            "Exam must be between 0 and 70.",
            true
        );

        return;
    }


    if(!session){

        message(
            "resultMessage",
            "Enter the academic session.",
            true
        );

        return;
    }


    try{

        /*
        IMPORTANT:
        Verify that the student actually registered
        the selected course in the selected semester.
        */

        const registrationQuery=query(
            collection(db,"registrations"),
            where("studentUid","==",studentUid),
            where("courseId","==",courseId)
        );

        const registrationSnap=
            await getDocs(registrationQuery);


        const registration=
            registrationSnap.docs
            .map(d=>d.data())
            .find(r=>r.semester===semester);


        if(!registration){

            message(
                "resultMessage",
                "Result rejected: this student did not register this course for the selected semester.",
                true
            );

            return;
        }


        const studentSnap=
            await getDoc(
                doc(db,"students",studentUid)
            );


        if(!studentSnap.exists()){

            message(
                "resultMessage",
                "Student record not found.",
                true
            );

            return;
        }


        const student=studentSnap.data();


        const course=
            allCourses.find(
                c=>c.id===courseId
            );


        if(!course){

            message(
                "resultMessage",
                "Course not found.",
                true
            );

            return;
        }


        const total=ca+exam;
        const grade=getGrade(total);
        const gradePoint=getGradePoint(grade);


        /*
        Check whether a result already exists
        for this student/course/semester.
        */

        const existingQuery=query(
            collection(db,"results"),
            where("studentUid","==",studentUid),
            where("courseId","==",courseId)
        );

        const existingSnap=
            await getDocs(existingQuery);


        const existing=
            existingSnap.docs.find(
                d=>d.data().semester===semester
            );


        const resultData={

            studentUid,

            studentName:student.name,

            courseId:course.id,

            courseCode:course.code,

            courseTitle:course.title,

            level:course.level,

            unit:registration.unit || course.unit || 2,

            ca,

            exam,

            total,

            score:total,

            grade,

            gradePoint,

            session,

            semester,

            updatedAt:serverTimestamp()

        };


        if(existing){

            await updateDoc(
                existing.ref,
                resultData
            );

            message(
                "resultMessage",
                `Result updated successfully. Total: ${total}/100 — Grade: ${grade}.`
            );

        }else{

            await addDoc(
                collection(db,"results"),
                {
                    ...resultData,
                    createdAt:serverTimestamp()
                }
            );

            message(
                "resultMessage",
                `Result saved successfully. Total: ${total}/100 — Grade: ${grade}.`
            );

        }


        $("resultCA").value="";
        $("resultExam").value="";

        await loadAdminResults();
        await updateAdminDashboard();

    }catch(error){

        message(
            "resultMessage",
            error.message,
            true
        );

    }

};


/* ================= ADMIN RESULTS TABLE ================= */

async function loadAdminResults(){

    try{

        const snap=
            await getDocs(
                collection(db,"results")
            );

        const body=$("adminResultsBody");

        body.innerHTML="";


        snap.docs.forEach(d=>{

            const result=d.data();

            const tr=document.createElement("tr");

            tr.innerHTML=`

                <td>${result.studentName || "-"}</td>

                <td>
                    <strong>${result.courseCode || "-"}</strong><br>
                    ${result.courseTitle || ""}
                </td>

                <td>${result.semester || "-"}</td>

                <td>${result.ca ?? "-"}</td>

                <td>${result.exam ?? "-"}</td>

                <td>${result.total ?? result.score ?? "-"}</td>

                <td>${result.grade || "-"}</td>

            `;

            body.appendChild(tr);

        });

    }catch(error){

        console.error(error);

    }

}


/* ================= ATTENDANCE COURSES ================= */

async function loadAttendanceCourses(){

    const select=$("attendanceCourse");

    select.innerHTML=
        `<option value="">Select Course</option>`;


    allCourses.forEach(course=>{

        const option=document.createElement("option");

        option.value=course.id;

        option.textContent=
            `${course.code} — ${course.title}`;

        select.appendChild(option);

    });

}


/* ================= LOAD ATTENDANCE STUDENTS ================= */

window.loadAttendanceStudents=async function(){

    const courseId=$("attendanceCourse").value;
    const date=$("attendanceDate").value;

    const body=$("attendanceStudentsBody");

    body.innerHTML="";


    if(!courseId || !date){

        message(
            "attendanceMessage",
            "Select a course and date.",
            true
        );

        return;
    }


    try{

        const q=query(
            collection(db,"registrations"),
            where("courseId","==",courseId)
        );

        const snap=await getDocs(q);


        attendanceRows=[];


        for(const registrationDoc of snap.docs){

            const registration=registrationDoc.data();

            const studentSnap=
                await getDoc(
                    doc(db,"students",registration.studentUid)
                );


            if(!studentSnap.exists()) continue;

            const student=studentSnap.data();

            attendanceRows.push({
                uid:registration.studentUid,
                name:student.name,
                matric:student.matricNumber || "Not assigned",
                courseCode:registration.courseCode,
                courseTitle:registration.courseTitle,
                status:"Present"
            });

        }


        if(attendanceRows.length===0){

            body.innerHTML=
                `<tr><td colspan="3">No registered students found for this course.</td></tr>`;

            return;
        }


        attendanceRows.forEach((row,index)=>{

            const tr=document.createElement("tr");

            tr.innerHTML=`

                <td>${row.name}</td>

                <td>${row.matric}</td>

                <td>

                    <select
                        class="attendance-status"
                        data-index="${index}">

                        <option value="Present">Present</option>
                        <option value="Absent">Absent</option>

                    </select>

                </td>

            `;

            body.appendChild(tr);

        });

    }catch(error){

        message(
            "attendanceMessage",
            error.message,
            true
        );

    }

};


/* ================= SAVE ATTENDANCE ================= */

window.saveAttendance=async function(){

    const courseId=$("attendanceCourse").value;
    const date=$("attendanceDate").value;

    if(!courseId || !date){

        message(
            "attendanceMessage",
            "Select a course and date first.",
            true
        );

        return;
    }


    const course=
        allCourses.find(
            c=>c.id===courseId
        );


    try{

        const selects=
            document.querySelectorAll(
                ".attendance-status"
            );


        for(const select of selects){

            const index=
                Number(select.dataset.index);

            const row=
                attendanceRows[index];

            const attendanceId=
                `${row.uid}_${courseId}_${date}`;

            await setDoc(
                doc(
                    db,
                    "attendance",
                    attendanceId
                ),
                {
                    studentUid:row.uid,
                    studentName:row.name,
                    courseId,
                    courseCode:course.code,
                    courseTitle:course.title,
                    date,
                    status:select.value,
                    createdAt:serverTimestamp()
                },
                {merge:true}
            );

        }


        message(
            "attendanceMessage",
            "Attendance saved successfully."
        );

    }catch(error){

        message(
            "attendanceMessage",
            error.message,
            true
        );

    }

};


/* ================= POST ANNOUNCEMENT ================= */

window.postAnnouncement=async function(){

    const title=$("announcementTitle").value.trim();
    const text=$("announcementText").value.trim();

    if(!title || !text){

        message(
            "announcementMessage",
            "Enter both title and announcement.",
            true
        );

        return;
    }


    try{

        await addDoc(
            collection(db,"announcements"),
            {
                title,
                message:text,
                createdAt:serverTimestamp()
            }
        );


        $("announcementTitle").value="";
        $("announcementText").value="";


        message(
            "announcementMessage",
            "Announcement posted successfully."
        );


        await loadAdminAnnouncements();

        await loadStudentAnnouncements();

    }catch(error){

        message(
            "announcementMessage",
            error.message,
            true
        );

    }

};


/* ================= ADMIN ANNOUNCEMENTS ================= */

async function loadAdminAnnouncements(){

    try{

        const snap=
            await getDocs(
                collection(db,"announcements")
            );

        const list=$("adminAnnouncementsList");

        list.innerHTML="";


        snap.docs.forEach(d=>{

            const data=d.data();

            const div=document.createElement("div");

            div.className="card";

            div.innerHTML=`

                <h3>${data.title}</h3>

                <p>${data.message}</p>

                <button
                    class="logout"
                    onclick="deleteAnnouncement('${d.id}')">
                    Delete
                </button>

            `;

            list.appendChild(div);

        });

    }catch(error){

        console.error(error);

    }

}


/* ================= DELETE ANNOUNCEMENT ================= */

window.deleteAnnouncement=async function(id){

    await deleteDoc(
        doc(db,"announcements",id)
    );

    await loadAdminAnnouncements();

};


/* ================= PROFILE UPDATE ================= */
window.updateStudentProfile=async function(){const name=$("editProfileName").value.trim(),phone=$("editProfilePhone").value.trim();if(!name){message("profileEditMessage","Name cannot be empty.",true);return;}try{await updateDoc(doc(db,"students",currentUser.uid),{name,phone,updatedAt:serverTimestamp()});currentStudent.name=name;currentStudent.phone=phone;fillStudentProfile();$("studentTopName").textContent=name;$("welcomeName").textContent=name;message("profileEditMessage","Profile updated successfully.");}catch(error){message("profileEditMessage",error.message,true)}};
window.sendPasswordReset=async function(){try{const {sendPasswordResetEmail}=await import("https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js");await sendPasswordResetEmail(auth,currentStudent.email);message("profileEditMessage","Password reset email sent.");}catch(error){message("profileEditMessage",error.message,true)}};
async function loadRegistrationSlip(){if(!currentUser)return;try{const snap=await getDocs(query(collection(db,"registrations"),where("studentUid","==",currentUser.uid)));const rows=snap.docs.map(d=>d.data());const render=(sem,title)=>{const list=rows.filter(r=>r.semester===sem);if(!list.length)return `<h3>${title}</h3><p>No courses registered.</p>`;return `<h3>${title}</h3><table><thead><tr><th>#</th><th>Code</th><th>Course</th><th>Unit</th></tr></thead><tbody>${list.map((r,i)=>`<tr><td>${i+1}</td><td>${r.courseCode}</td><td>${r.courseTitle}</td><td>${r.unit}</td></tr>`).join("")}</tbody></table><p><strong>Total Units:</strong> ${list.reduce((s,r)=>s+Number(r.unit||0),0)}</p>`};$("registrationSlipArea").innerHTML=`<div class="print-actions no-print"><button class="primary" onclick="window.print()">Print / Save PDF</button></div><div style="text-align:center"><h1>KWASU STUDENT HUB</h1><h2>COURSE REGISTRATION SLIP</h2></div><p><strong>Name:</strong> ${currentStudent.name}</p><p><strong>Matric:</strong> ${currentStudent.matricNumber||"Not assigned"}</p><p><strong>Department:</strong> ${currentStudent.department}</p><p><strong>Level:</strong> ${currentStudent.level} Level</p>${render("First Semester","First Semester")}${render("Second Semester","Second Semester")}`;}catch(error){$("registrationSlipArea").innerHTML=`<div class="message error">${error.message}</div>`}}
async function loadStudentTranscript(){if(!currentUser)return;try{const [rs,gs]=await Promise.all([getDocs(query(collection(db,"results"),where("studentUid","==",currentUser.uid))),getDocs(query(collection(db,"registrations"),where("studentUid","==",currentUser.uid)))]);const registered=new Set(gs.docs.map(d=>{const r=d.data();return `${r.courseId}__${r.semester}`}));const results=rs.docs.map(d=>d.data()).filter(r=>registered.has(`${r.courseId}__${r.semester}`));const section=(sem,title)=>{const list=results.filter(r=>r.semester===sem);return `<h3>${title}</h3>${list.length?`<table><thead><tr><th>Course</th><th>Unit</th><th>Total</th><th>Grade</th><th>GP</th></tr></thead><tbody>${list.map(r=>`<tr><td><strong>${r.courseCode}</strong><br>${r.courseTitle}</td><td>${r.unit}</td><td>${r.total??r.score}</td><td>${r.grade}</td><td>${r.gradePoint??getGradePoint(r.grade)}</td></tr>`).join("")}</tbody></table><p><strong>GPA:</strong> ${calculateGPA(list).toFixed(2)}</p>`:`<p>No results available.</p>`}`};$("studentTranscriptArea").innerHTML=`<div style="text-align:center"><h1>KWASU STUDENT HUB</h1><h2>STUDENT RESULT STATEMENT</h2></div><p><strong>Name:</strong> ${currentStudent.name}</p><p><strong>Matric:</strong> ${currentStudent.matricNumber||"Not assigned"}</p><p><strong>Department:</strong> ${currentStudent.department}</p><p><strong>Level:</strong> ${currentStudent.level} Level</p>${section("First Semester","First Semester")}${section("Second Semester","Second Semester")}<hr><p><strong>Overall CGPA:</strong> ${calculateCGPA(results).toFixed(2)}</p>`;}catch(error){$("studentTranscriptArea").innerHTML=`<div class="message error">${error.message}</div>`}}
window.printStudentTranscript=function(){loadStudentTranscript().then(()=>setTimeout(()=>window.print(),300))};
async function countStudentNotifications(){try{const [a,r]=await Promise.all([getDocs(collection(db,"announcements")),getDocs(query(collection(db,"results"),where("studentUid","==",currentUser.uid)))]);return a.size+r.size}catch(e){return 0}}
async function loadStudentNotifications(){if(!currentUser)return;const list=$("studentNotificationsList");list.innerHTML="";try{const [a,r]=await Promise.all([getDocs(collection(db,"announcements")),getDocs(query(collection(db,"results"),where("studentUid","==",currentUser.uid)))]);const items=[];a.docs.forEach(d=>{const x=d.data();items.push({type:"Announcement",title:x.title||"Announcement",text:x.message||"",date:x.createdAt?.toDate?x.createdAt.toDate():new Date()})});r.docs.forEach(d=>{const x=d.data();items.push({type:"Result",title:`Result available: ${x.courseCode||""}`,text:`${x.total??x.score??"-"} (${x.grade||"-"}) — ${x.semester||""}`,date:x.updatedAt?.toDate?x.updatedAt.toDate():new Date()})});items.sort((a,b)=>b.date-a.date);if(!items.length){list.innerHTML='<div class="card">No notifications yet.</div>';return}items.forEach(x=>{const div=document.createElement("div");div.className="notification unread";div.innerHTML=`<strong>${x.type}</strong><h3>${x.title}</h3><p>${x.text}</p><small>${x.date.toLocaleString()}</small>`;list.appendChild(div)})}catch(error){list.innerHTML=`<div class="message error">${error.message}</div>`}}
async function loadStudentCalendar(){const list=$("studentCalendarList");if(!list)return;list.innerHTML="";try{const snap=await getDocs(collection(db,"calendar"));const events=snap.docs.map(d=>d.data()).sort((a,b)=>String(a.date).localeCompare(String(b.date)));if(!events.length){list.innerHTML='<div class="card">No academic calendar events have been added yet.</div>';return}events.forEach(e=>{const div=document.createElement("div");div.className="calendar-item";div.innerHTML=`<strong>${e.date||"-"}</strong><h3>${e.title||"Academic Event"}</h3><p>${e.description||""}</p><small>${e.semester||""}</small>`;list.appendChild(div)})}catch(error){list.innerHTML=`<div class="message error">${error.message}</div>`}}
window.addCalendarEvent=async function(){const date=$("calendarDate").value,title=$("calendarTitle").value.trim(),semester=$("calendarSemester").value,description=$("calendarDescription").value.trim();if(!date||!title){message("calendarMessage","Enter the date and event title.",true);return}try{await addDoc(collection(db,"calendar"),{date,title,semester,description,createdAt:serverTimestamp()});$("calendarDate").value="";$("calendarTitle").value="";$("calendarDescription").value="";message("calendarMessage","Calendar event added successfully.");await loadAdminCalendar()}catch(error){message("calendarMessage",error.message,true)}};
async function loadAdminCalendar(){const list=$("adminCalendarList");if(!list)return;list.innerHTML="";try{const snap=await getDocs(collection(db,"calendar"));const events=snap.docs.map(d=>({id:d.id,...d.data()})).sort((a,b)=>String(a.date).localeCompare(String(b.date)));if(!events.length){list.innerHTML='<div class="card">No events yet.</div>';return}events.forEach(e=>{const div=document.createElement("div");div.className="card";div.innerHTML=`<h3>${e.title}</h3><p><strong>${e.date}</strong> — ${e.semester||""}</p><p>${e.description||""}</p><button class="logout" onclick="deleteCalendarEvent('${e.id}')">Delete</button>`;list.appendChild(div)})}catch(error){list.innerHTML=`<div class="message error">${error.message}</div>`}}
window.deleteCalendarEvent=async function(id){if(!confirm("Delete this calendar event?"))return;await deleteDoc(doc(db,"calendar",id));await loadAdminCalendar()};
async function loadStudentSearchData(){if(!adminStudentsCache.length){const snap=await getDocs(collection(db,"students"));adminStudentsCache=snap.docs.map(d=>({id:d.id,...d.data()}))}const dept=$("adminSearchDept2");if(dept&&dept.options.length===1)departments.forEach(x=>{const o=document.createElement("option");o.value=x;o.textContent=x;dept.appendChild(o)});renderStudentSearch()}
window.renderStudentSearch=function(){const body=$("studentSearchBody");if(!body)return;const q=($("adminSearch2")?.value||"").toLowerCase().trim(),level=$("adminSearchLevel2")?.value||"",dept=$("adminSearchDept2")?.value||"";const rows=adminStudentsCache.filter(s=>{const text=[s.name,s.email,s.matricNumber,s.department].join(" ").toLowerCase();return(!q||text.includes(q))&&(!level||String(s.level)===level)&&(!dept||s.department===dept)});body.innerHTML="";if(!rows.length){body.innerHTML='<tr><td colspan="6">No students found.</td></tr>';return}rows.forEach(s=>{const cls=s.status==="approved"?"approved":s.status==="pending"?"pending":"rejected";const tr=document.createElement("tr");tr.innerHTML=`<td>${s.name||"-"}</td><td class="matric">${s.matricNumber||"Not assigned"}</td><td>${s.department||"-"}</td><td>${s.level||"-"}</td><td><span class="badge ${cls}">${s.status||"-"}</span></td><td>${s.status==="approved"?`<button class="secondary" onclick="assignMatric('${s.uid}')">Assign Matric</button>`:"-"}</td>`;body.appendChild(tr)})};
/* ================= COURSE CATALOG UPGRADE ================= */
const upgradeFirst=["Introduction to {D}","Fundamentals of {D}","Principles of {D}","Basic Concepts in {D}","Academic Skills in {D}","Methods of {D}","Applied {D}","Intermediate {D}","Advanced {D}","Practical {D}","Research Methods in {D}","Professional Practice in {D}","Systems and Applications of {D}","Technology in {D}","Management of {D}"];
const upgradeSecond=["Advanced Studies in {D}","Concepts and Applications of {D}","Laboratory Practice in {D}","Problem Solving in {D}","Data and Analysis in {D}","Contemporary Issues in {D}","Project Development in {D}","Advanced Applications of {D}","Industrial Practice in {D}","Professional Ethics in {D}","Research Seminar in {D}","Innovation in {D}","Emerging Trends in {D}","Case Studies in {D}","Capstone Practice in {D}"];
window.upgradeCourseCatalogue=async function(){try{message("courseSeedMessage","Updating semester-based catalogue. Please wait...");const ops=[];for(const dept of departments){const prefix=dept.split(" ").map(w=>w[0]).join("").substring(0,4).toUpperCase();for(const level of ["100","200","300","400","500"]){[upgradeFirst,upgradeSecond].forEach((arr,si)=>arr.forEach((tpl,i)=>{const sem=si===0?"First Semester":"Second Semester",tag=si===0?"F":"S",n=i+1;ops.push({id:`${prefix}_${level}_${tag}_${String(n).padStart(2,"0")}`,data:{code:`${prefix}${level}${tag}${String(n).padStart(2,"0")}`,title:tpl.replace("{D}",dept),department:dept,level,semester:sem,unit:n>=13?3:2,type:"departmental"}})}))}}for(const c of generalCourses){const [code,title,level,unit]=c;const semester=Number(level)%2===0?"First Semester":"Second Semester";ops.push({id:`upgrade_general_${code}`,data:{code,title,department:"All Departments",level,semester,unit,type:"general"}})}for(let i=0;i<ops.length;i+=450){const batch=writeBatch(db);ops.slice(i,i+450).forEach(x=>batch.set(doc(db,"courses",x.id),x.data,{merge:true}));await batch.commit();message("courseSeedMessage",`Course catalogue: ${Math.min(i+450,ops.length)} / ${ops.length}`)}await loadCourses();await loadAdminCourses();message("courseSeedMessage",`Course catalogue upgraded. ${ops.length} semester-aware course records were processed.`)}catch(error){message("courseSeedMessage",error.message,true)}};

/* ================= LOGOUT ================= */

window.logoutUser=async function(){

    await signOut(auth);

    currentUser=null;
    currentStudent=null;

    hideAllPages();

    $("landingPage").classList.remove("hidden");

};


/* ================= INITIAL ================= */

populateDepartmentSelect();
