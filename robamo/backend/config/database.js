const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, '../database');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.join(dbDir, 'robamo.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initializeDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'student',
      city TEXT,
      school_name TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS schools (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      city TEXT,
      phone TEXT,
      is_approved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS certificates (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cert_id TEXT UNIQUE NOT NULL,
      student_name TEXT NOT NULL,
      student_email TEXT,
      course_name TEXT NOT NULL,
      school_name TEXT,
      grade TEXT,
      issued_by TEXT DEFAULT 'ROBAMO',
      issued_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      grade_level TEXT NOT NULL,
      duration_hours INTEGER,
      modules INTEGER,
      difficulty TEXT DEFAULT 'Beginner',
      price REAL DEFAULT 0,
      emoji TEXT DEFAULT '🤖',
      color_class TEXT DEFAULT 'purple',
      what_you_learn TEXT,
      requirements TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS course_modules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      module_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      duration_hours REAL DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
    CREATE TABLE IF NOT EXISTS course_lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      module_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      lesson_number INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      lesson_type TEXT DEFAULT 'video',
      duration_minutes INTEGER DEFAULT 30,
      is_free INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES course_modules(id),
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_name TEXT NOT NULL,
      age INTEGER,
      grade TEXT NOT NULL,
      course_id INTEGER,
      course_name TEXT,
      parent_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      school_name TEXT,
      city TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id)
    );
    CREATE TABLE IF NOT EXISTS demo_bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT,
      user_type TEXT DEFAULT 'parent',
      email TEXT,
      school_name TEXT,
      preferred_date TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS school_partnerships (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school_name TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      student_count TEXT,
      email TEXT,
      message TEXT,
      status TEXT DEFAULT 'new',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT,
      user_type TEXT DEFAULT 'parent',
      message TEXT NOT NULL,
      status TEXT DEFAULT 'unread',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS showcase_projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      student_name TEXT NOT NULL,
      grade TEXT,
      city TEXT,
      category TEXT,
      description TEXT,
      emoji TEXT DEFAULT '🤖',
      bg_class TEXT DEFAULT 'bg1',
      is_featured INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      role TEXT,
      content TEXT NOT NULL,
      rating INTEGER DEFAULT 5,
      avatar_letter TEXT,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS blog_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      excerpt TEXT,
      content TEXT,
      read_time INTEGER DEFAULT 5,
      emoji TEXT DEFAULT '📝',
      bg_class TEXT DEFAULT 'b1',
      published INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS downloads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      file_path TEXT,
      emoji TEXT DEFAULT '📄',
      download_count INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Database tables initialized');
  seedData();
}

function seedData() {
  // COURSES
  const courseCount = db.prepare('SELECT COUNT(*) as cnt FROM courses').get().cnt;
  if (courseCount === 0) {
    const ins = db.prepare(`INSERT INTO courses (title,description,grade_level,duration_hours,modules,difficulty,emoji,color_class,what_you_learn,requirements) VALUES (?,?,?,?,?,?,?,?,?,?)`);
    const courses = [
      ['Robotics Spark — Junior',
       'Chhote students ke liye robots ki magical duniya! Hands-on kits se apna pehla robot banao aur coding ki nayi bhasha seekho. Bilkul beginner-friendly — koi experience nahi chahiye.',
       'Grade 1-5', 24, 8, 'Beginner', '🤖', 'purple',
       'Robot ke basic parts samajhna|Sensors aur motors ka use|Block-based coding seekhna|Simple circuits banana|Apna pehla moving robot build karna|Fun project challenges|Team mein kaam karna|Basic problem solving',
       'Koi prior experience nahi chahiye|Age 6-11|Curiosity aur enthusiasm|Parent/teacher support helpful'],

      ['Scratch & Code — Creative Coding',
       'Visual programming se games, animations aur stories banao! Scratch use karke coding ki fundamentals seekho — koi typing ki zaroorat nahi. Creativity ko code mein badlo.',
       'Grade 1-5', 20, 6, 'Beginner', '🧩', 'amber',
       'Visual block programming|Animated games banana|Interactive stories design karna|Math concepts coding se seekhna|Music aur art projects|Online projects share karna|Logical thinking develop karna|Debugging skills',
       'Basic computer use aana chahiye|Age 7-11|Mouse aur keyboard ki basic knowledge|Koi coding experience nahi chahiye'],

      ['AI Foundations — Middle School',
       'Machines kaise sochti hain? AI ke concepts real examples se seekho. Apna pehla AI model banao aur samjho ki ChatGPT aur Google jaise tools kaise kaam karte hain.',
       'Grade 6-8', 48, 12, 'Intermediate', '🧠', 'teal',
       'AI aur Machine Learning kya hai|Computers kaise data se seekhte hain|Image recognition project banana|Apna chatbot design karna|Natural Language Processing basics|Data patterns identify karna|AI ethics samajhna|Real-world AI applications explore karna',
       'Basic computer knowledge|Age 11-14|Class 6 level math|Curiosity about technology'],

      ['Arduino Robotics — Maker Level',
       'Real hardware pe kaam karo! Arduino microcontroller se sensors, motors aur circuits connect karo. Line-following robot banao, Bluetooth se control karo aur real engineering experience lo.',
       'Grade 6-8', 40, 10, 'Intermediate', '🔧', 'green',
       'Arduino IDE setup aur programming|Sensors — ultrasonic, IR, temperature|DC aur servo motors control|LED matrix displays|Line following robot build karna|Obstacle detecting robot|Bluetooth remote control project|Circuit design basics',
       'Basic math (Class 6+)|Age 11-14|Interest in electronics|Curiosity for how machines work'],

      ['Robotics Pro — Competition Level',
       'Industry-level robotics! Autonomous systems, computer vision aur ROS seekho. National robotics competitions ke liye taiyari karo. IIT-style projects aur mentorship.',
       'Grade 9-12', 72, 18, 'Advanced', '🦾', 'purple',
       'Autonomous robot navigation|Computer vision with OpenCV|ROS (Robot Operating System) basics|Robotic arm programming|PID control systems|AI + Robotics integration|Competition strategy aur team work|Real-world project deployment',
       'Arduino Robotics course ya equivalent knowledge|Age 14-18|Python basics helpful|Dedication for project work'],

      ['Machine Learning & Deep Learning',
       'Python se real ML models banao. Neural networks, TensorFlow aur actual AI applications develop karo. Career-ready AI skills ke liye complete course — internship aur placement support bhi.',
       'Advanced', 96, 24, 'Expert', '🔬', 'amber',
       'Python for Data Science|NumPy, Pandas, Matplotlib|Supervised aur Unsupervised Learning|Neural Network architecture|TensorFlow aur Keras|Image classification project|NLP — sentiment analysis|Model deployment on web|Kaggle competitions participation',
       'Python programming (basic level)|Class 10+ mathematics|AI Foundations course ya equivalent|Laptop with Python installed|Strong learning commitment'],
    ];
    courses.forEach(c => ins.run(...c));
    console.log('✅ Courses seeded');

    // MODULES for Course 1 — Robotics Spark
    const modIns = db.prepare('INSERT INTO course_modules (course_id,module_number,title,description,duration_hours) VALUES (?,?,?,?,?)');
    const lesIns = db.prepare('INSERT INTO course_lessons (module_id,course_id,lesson_number,title,lesson_type,duration_minutes,is_free) VALUES (?,?,?,?,?,?,?)');

  const m1 = [
   [1, 1, 'Welcome to the World of Robots!', 'What robots are, their types, and history', 2],
   [1, 2, 'Robot Parts — Sensors & Actuators', 'Exploring ultrasonic sensors, IR sensors, and servo motors', 3],
   [1, 3, 'Basics of Block Coding', 'Controlling robots using Scratch-style programming', 3],
   [1, 4, 'Build Your First Circuit', 'Hands-on project with LED, buzzer, and simple circuits', 3],
   [1, 5, 'Moving Robot Build — Part 1', 'Assembling wheels, motors, and chassis', 3],
   [1, 6, 'Moving Robot Build — Part 2', 'Programming and making the robot move', 3],
   [1, 7, 'Sensor-Based Reactions', 'Teaching the robot to avoid obstacles', 4],
   [1, 8, 'Final Project — Mini Robot Showcase', 'Present your robot and earn a certificate!', 3],
  ];
    m1.forEach(m => {
      const mr = modIns.run(...m);
      const mid = mr.lastInsertRowid;
      const cid = 1;
      if (m[1] === 1) {
        lesIns.run(mid,cid,1,'Robots Kya Hote Hain? — Intro Video','video',15,1);
        lesIns.run(mid,cid,2,'Types of Robots — Industrial, Medical, Domestic','video',20,1);
        lesIns.run(mid,cid,3,'History of Robotics — Timeline Activity','project',25,0);
      } else if (m[1] === 2) {
        lesIns.run(mid,cid,1,'Sensors kya hote hain? — Explanation','video',18,1);
        lesIns.run(mid,cid,2,'Ultrasonic Sensor Hands-On','project',30,0);
        lesIns.run(mid,cid,3,'Servo Motor Control Practice','project',30,0);
        lesIns.run(mid,cid,4,'Module Quiz','quiz',10,0);
      } else if (m[1] === 3) {
        lesIns.run(mid,cid,1,'Block Coding Platform Introduction','video',15,1);
        lesIns.run(mid,cid,2,'Commands — Move Forward, Turn, Stop','video',20,0);
        lesIns.run(mid,cid,3,'Loops aur Conditions','video',25,0);
        lesIns.run(mid,cid,4,'Mini Coding Challenge','project',30,0);
      } else {
        lesIns.run(mid,cid,1,'Theory — Concepts Explained','video',20,0);
        lesIns.run(mid,cid,2,'Hands-On Activity','project',35,0);
        lesIns.run(mid,cid,3,'Practice Quiz','quiz',10,0);
      }
    });

    // MODULES for Course 3 — AI Foundations
    const m3 = [
      [3,1,'AI Kya Hai? — Introduction','Artificial Intelligence ki duniya mein pehla kadam',2],
      [3,2,'Machine Learning Basics','Machines kaise data se seekhti hain',4],
      [3,3,'Types of ML — Supervised & Unsupervised','Classification aur clustering samajhna',4],
      [3,4,'Data aur Patterns','Data collection, cleaning aur visualization',4],
      [3,5,'Image Recognition Project','Teachable Machine se apna image classifier banana',5],
      [3,6,'Natural Language Processing','Text ko AI kaise samajhti hai',4],
      [3,7,'Chatbot Design karo','Simple rule-based aur AI chatbot banana',5],
      [3,8,'AI in Real World','Healthcare, farming, education mein AI',4],
      [3,9,'AI Ethics — Bias aur Fairness','Responsible AI ke principles',3],
      [3,10,'Neural Networks — Visual Understanding','Deep learning ka basic samajhna',4],
      [3,11,'Capstone Project — Part 1','Apna AI project plan aur build karo',5],
      [3,12,'Capstone Project — Demo & Certificate','Present karo aur certificate pao!',4],
    ];
    m3.forEach(m => {
      const mr = modIns.run(...m);
      const mid = mr.lastInsertRowid;
      const cid = 3;
      if (m[1] === 1) {
        lesIns.run(mid,cid,1,'AI kya hai? Simple explanation','video',20,1);
        lesIns.run(mid,cid,2,'AI vs Human Intelligence','video',15,1);
        lesIns.run(mid,cid,3,'AI Applications jo tum roz use karte ho','project',20,0);
      } else if (m[1] === 2) {
        lesIns.run(mid,cid,1,'Machine Learning ka concept','video',25,1);
        lesIns.run(mid,cid,2,'Training Data kya hoti hai','video',20,0);
        lesIns.run(mid,cid,3,'ML model demo — banana classifier','project',40,0);
        lesIns.run(mid,cid,4,'Quiz — ML Basics','quiz',15,0);
      } else {
        lesIns.run(mid,cid,1,'Concept Introduction','video',25,0);
        lesIns.run(mid,cid,2,'Hands-on Lab','project',40,0);
        lesIns.run(mid,cid,3,'Assessment Quiz','quiz',15,0);
      }
    });

    // MODULES for Course 5 — Robotics Pro
    const m5 = [
      [5,1,'Advanced Robot Architecture','Complex systems design aur planning',4],
      [5,2,'Python for Robotics','Python programming for hardware control',5],
      [5,3,'Computer Vision Fundamentals','OpenCV se camera-based detection',5],
      [5,4,'ROS — Robot Operating System','Industry standard robotics framework',6],
      [5,5,'Autonomous Navigation','Path planning aur obstacle avoidance algorithms',6],
      [5,6,'Robotic Arm Programming','Inverse kinematics aur arm control',5],
      [5,7,'PID Control Systems','Precise motor control engineering',5],
      [5,8,'AI Integration in Robots','Machine learning on hardware',6],
      [5,9,'Wireless Communication','WiFi, Bluetooth, RF protocols',4],
      [5,10,'Competition Robotics Strategy','Team work aur match strategy',4],
      [5,11,'Project Build — Phase 1','Main project assembly aur coding',8],
      [5,12,'Project Build — Phase 2','Testing, debugging, optimization',6],
      [5,13,'Documentation & Presentation','Technical report aur demo preparation',4],
      [5,14,'Mock Competition','Practice competition environment',5],
      [5,15,'National Competition Prep','Final polish aur strategy',4],
      [5,16,'Advanced Sensors Lab','LIDAR, IMU, GPS integration',4],
      [5,17,'Industry Visit & Guest Lecture','IIT/startup engineers ke saath interaction',3],
      [5,18,'Final Showcase & Certification','Present karo, jito, celebrate karo!',3],
    ];
    m5.forEach(m => {
      const mr = modIns.run(...m);
      const mid = mr.lastInsertRowid;
      const cid = 5;
      lesIns.run(mid,cid,1,'Concept & Theory','video',30,m[1]<=2?1:0);
      lesIns.run(mid,cid,2,'Lab Session','project',60,0);
      lesIns.run(mid,cid,3,'Code Walkthrough','video',25,0);
      lesIns.run(mid,cid,4,'Challenge Task','project',45,0);
    });

    console.log('✅ Course modules & lessons seeded');
  }

  // TESTIMONIALS
  const testiCount = db.prepare('SELECT COUNT(*) as cnt FROM testimonials').get().cnt;
  if (testiCount === 0) {
    const ti = db.prepare('INSERT INTO testimonials (name,role,content,rating,avatar_letter) VALUES (?,?,?,?,?)');
    [
      ['Priya Sharma', 'Parent, Delhi', 'Mere bete ne ROBAMO ka Robotics Spark course kiya aur uski confidence mein zameen aasman ka fark aa gaya! Pehle woh technology se darta tha, ab khud se robot banata hai. Teachers bahut patient aur knowledgeable hain. 100% recommend!', 5, 'P'],
      ['Rahul Gupta', 'Principal, DPS Gurugram', 'Humne ROBAMO ko apne school mein introduce kiya 6 months pehle. Students ka engagement level phenomenal hai. Curriculum well-structured hai aur delivery team very professional. Best STEM investment we have made.', 5, 'R'],
      ['Ananya Singh', 'Student, Grade 9, Noida', 'AI Foundations course ne meri zindagi badal di! Maine national AI olympiad mein 2nd place liya iss course ke baad. ROBAMO ke teachers real-life examples se samjhate hain jo bahut help karta hai. Highly recommended!', 5, 'A'],
      ['Dr. Meena Joshi', 'Parent & Doctor, Mumbai', 'Medical professional hone ke naate main jaanti hoon ki AI healthcare ka future hai. ROBAMO ne meri beti ko yeh basics 13 saal ki umar mein sikhaye. Amazing platform with excellent safety measures.', 5, 'M'],
      ['Vikram Tiwari', 'IT Teacher, Pune', 'As an educator, ROBAMO ka curriculum design mujhe impress karta hai. Age-appropriate content, hands-on projects aur proper assessment system — yeh exactly waisi hai jo schools ko chahiye. Student results speak for themselves.', 5, 'V'],
      ['Sunita Yadav', 'Parent, Lucknow', 'Small city mein rehte hain toh quality education accessible nahi thi. ROBAMO ne yeh gap fill kiya. Online classes bhi itni engaging hain ki mera beta kabhi miss nahi karta. Affordable fees bhi hai!', 5, 'S'],
    ].forEach(t => ti.run(...t));
    console.log('✅ Testimonials seeded');
  }

  // BLOG
  const blogCount = db.prepare('SELECT COUNT(*) as cnt FROM blog_posts').get().cnt;
  if (blogCount === 0) {
    const bi = db.prepare('INSERT INTO blog_posts (title,category,excerpt,content,read_time,emoji,bg_class) VALUES (?,?,?,?,?,?,?)');
    [
      ['AI 2025 mein Kya Naya Hai? — Students ke liye Complete Guide',
       'AI Trends',
       '2025 mein AI ne education, healthcare aur daily life mein revolutionary changes laaye hain. Iss guide mein jaanein kaise yeh technologies students ke future ko shape kar rahi hain aur aap abhi se kaise prepare ho sakte hain.',
       `Artificial Intelligence 2025 mein sirf ek technology nahi rahi — yeh ek lifestyle ban gayi hai. Schools mein AI-powered tutors hain, hospitals mein AI doctors assist karte hain, aur farms mein AI crops monitor karta hai.

Students ke liye sabse badi opportunity hai yeh samajhna ki AI kaise kaam karta hai. Jab aap AI ki internals samajhte hain — jaise neural networks, training data, aur algorithms — tab aap sirf users nahi, balki creators bante hain.

ROBAMO mein hum precisely yahi sikhate hain. Hamare AI Foundations course mein aap:
• Teachable Machine se apna image classifier banate ho
• Scratch-based chatbot design karte ho
• Real datasets pe kaam karte ho
• Apne AI models ko friends ko demonstrate karte ho

2025 ki top AI trends jo students ko jaanni chahiye:
1. Multimodal AI — text, image, voice sab ek saath
2. AI Agents — khud se task complete karne wale systems
3. Edge AI — sensors aur devices pe directly AI run karna
4. Responsible AI — bias detection aur fairness

Abhi sahi time hai AI seekhne ka. 2030 tak India mein 1 million+ AI jobs honge. Kya aap ready ho?`,
       7, '🤖', 'b1'],

      ['Robotics Competition Mein Kaise Jeetein? — Insider Tips',
       'Competitions',
       'National aur state level robotics competitions mein top karne ke liye kya chahiye? ROBAMO ke competition winners share karte hain unki preparation strategy, common mistakes aur winning mindset.',
       `Robotics competition jeetna sirf robot banana nahi hai — yeh strategy, teamwork aur presentation ka combination hai.

ROBAMO ke students ne past 2 saalon mein 47 awards jite hain. Unse main tips yeh hain:

1. ROBOT DESIGN (40% marks)
Design simple rakho. Judges complex robots se impressed nahi hote — woh reliable robots se impressed hote hain. Ek robot jo 9/10 baar sahi kaam kare, ek fancy robot se better hai jo 5/10 baar fail ho.

2. CODE QUALITY (25% marks)
Clean code likhna seekho. Comments daalo. Modular functions use karo. Judges code bhi dekhe hain competition mein.

3. PRESENTATION (20% marks)
Apna project 2 minutes mein explain karne ki practice karo. Problem → Solution → How it works → Future improvements. Simple structure, confident delivery.

4. DOCUMENTATION (15% marks)
Build diary maintain karo roz. Photos lo, challenges note karo, solutions document karo. Judges yeh passionately padhte hain.

MOST IMPORTANT: Practice under competition conditions. Noisy environment mein test karo. Time pressure mein code karo. Yeh sab competition day ke stress ko khatam karta hai.

ROBAMO ke Robotics Pro course mein mock competitions regularly hote hain. Join karo aur real experience lo!`,
       8, '🏆', 'b2'],

      ['Parents ke liye AI & Robotics Guide — Bachche ko Kaise Support Karein?',
       'Parents Guide',
       'Aapka bachcha AI ya Robotics seekhna chahta hai? Samajh nahi aa raha kahan se shuru karein? Yeh guide parents ke liye specifically likhi gayi hai — simple language mein, practical tips ke saath.',
       `Dear Parents,

Aap sahi jagah aaye hain. Aapke bachche ka AI & Robotics mein interest — yeh ek bahut positive sign hai. Main aapko guide karunga ki aap is journey mein kaise support kar sakte hain.

KYON ZARORI HAI?
India 2030 tak global AI hub banne ki raah par hai. Government ne National AI Mission launch ki hai. Top companies — Google, Microsoft, Infosys — sab AI engineers hire kar rahe hain. Aaj jo bachcha AI seekhta hai, kal uske career options unlimited hote hain.

COMMON PARENTAL CONCERNS:

"Mera bachcha bahut chhota hai — Grade 3 mein hai"
ROBAMO ka Robotics Spark course Grade 1 se start hota hai. Chhote bachche actually better learners hote hain kyunki unke dimag mein no fear of failure hoti hai. Humara curriculum age-appropriate hai.

"Main khud technology nahi jaanta — kaise help karunga?"
Aapko kuch jaanne ki zaroorat nahi. Aapka kaam sirf encourage karna hai, provide karna hai resources, aur celebrate karna hai progress. Humari team sab handle karti hai.

"Bahut time lagega? Padhai pe impact?"
ROBAMO courses 2-3 ghante weekly hain. Actually research shows ki STEM activities padhai pe positive impact karti hain — problem solving skills improve hoti hain jo math mein bhi help karti hai.

PRACTICAL TIPS:
• Ek dedicated workspace banao ghar mein for projects
• Competitions mein participate karne encourage karo
• Achievements celebrate karo — certificates wall pe lagao
• ROBAMO WhatsApp group join karo — parent community bahut helpful hai

Koi bhi sawaal ho — WhatsApp pe contact karo. Hum 2 hours mein respond karte hain.`,
       9, '👨‍👩‍👧', 'b3'],

      ['Python Programming Kab aur Kaise Seekhein? — Age-wise Roadmap',
       'Programming',
       'Python AI aur Robotics dono mein use hoti hai. Magar kab seekhni chahiye? Kaise start karein? Kaunse resources use karein? ROBAMO experts ka complete roadmap.',
       `Python seekhna aaj kal almost mandatory hai agar aap AI ya Robotics mein serious ho. Magar sahi time aur sahi approach jaanna zaroori hai.

AGE-WISE ROADMAP:

Grade 1-5 (Age 6-11): ABHI PYTHON MAT SEEKHO
Pehle logic seekho. Scratch, block coding, aur MIT App Inventor use karo. Yeh fundamentals Python ko later bahut aasaan banate hain. ROBAMO ka Robotics Spark aur Scratch & Code yahi karta hai.

Grade 6-8 (Age 11-14): PYTHON BASICS SHURU KARO
Iss age mein brain abstract thinking ke liye ready hota hai. Simple Python — variables, loops, functions — seekhna bilkul natural lagta hai. ROBAMO ke AI Foundations course mein Python ka introduction hota hai.

Grade 9-12 (Age 14-18): PYTHON SERIOUSLY SEEKHO
Ab projects banao. APIs use karo. Libraries — NumPy, Pandas, Matplotlib — seekho. ROBAMO ke Robotics Pro aur ML course mein yahi karte hain.

BEST RESOURCES:
• ROBAMO courses (structured, guided)
• Python.org official tutorial (free)
• CS50P — Harvard ka free online course
• Kaggle Learn — free, project-based

COMMON MISTAKES:
1. Tutorial hell — sirf videos dekhte rehna, code nahi likhna
2. Copy-paste coding — samjhe bina copy karna
3. Too many resources — ek hi resource finish karo pehle

Python ek tool hai. Important yeh hai ki aap KUCH BANANA CHAHTE HO Python se. Project-first approach raho — "mujhe yeh banana hai" → "Python se kaise banega?" Yahi best learning method hai.`,
       10, '🐍', 'b1'],

      ['School mein AI Lab Kaise Shuru Karein? — Principal & Teacher Guide',
       'Schools',
       'AI Lab setup karna ab affordable aur easy ho gaya hai. ROBAMO 50+ schools ko AI Labs setup karwa chuki hai. Kya chahiye, kitna cost aata hai, kaun teach karega — sab jawaab yahan.',
       `AI Lab aaj ki zaroorat hai. Jo schools aaj invest karengi, unke students kal industry mein leaders honge.

AI LAB KE LIYE KYA CHAHIYE:

HARDWARE (minimum setup):
• 10 computers/laptops (basic spec kaafi hai)
• 5 Arduino starter kits — approx ₹3000 each
• 2-3 Raspberry Pi kits — approx ₹5000 each
• Webcams for computer vision
• Basic electronic components set

SOFTWARE (mostly free):
• Arduino IDE — free
• Python + Anaconda — free
• Scratch — free
• Google Teachable Machine — free
• ROBAMO learning management system

SPACE: Ek normal classroom kaafi hai. Flexible seating arrangement better hai.

TEACHERS: Yahi most important point hai. ROBAMO free teacher certification program deta hai. 40-hour online program mein teachers curriculum deliver karne ke liye fully prepared ho jaate hain.

CURRICULUM: ROBAMO ka structured, CBSE/ICSE aligned curriculum provide karta hai. Lesson plans, worksheets, assessments — sab ready-made.

COST ESTIMATE:
• Basic AI Lab setup: ₹1.5-3 lakhs (one-time)
• Annual ROBAMO partnership fee: Custom pricing based on school size
• ROI: Admissions pe positive impact, CBSE AI subject cover, national competition participations

50 se zyada schools already partner hain. Results? Average 40% increase in STEM interest, multiple national competition wins, improved problem-solving scores.

Contact us for a FREE school assessment call!`,
       8, '🏫', 'b2'],

      ['Robotics aur AI mein Career Options — 2025-2030 ke Top Jobs',
       'Careers',
       'AI aur Robotics seekhne ke baad career options kya hain? Salary kya milti hai? Kaunsi companies hire karti hain? ROBAMO ka complete career guide unke liye jo aaj invest kar rahe hain apne future mein.',
       `Agar aap ya aapka bachcha AI aur Robotics seekh raha hai, toh yeh investment 10 saal mein 100x return dega. Here's why:

TOP CAREER PATHS:

1. AI/ML Engineer — ₹12-40 LPA starting
Companies: Google, Microsoft, Amazon, Flipkart, Startups
Skills needed: Python, TensorFlow, Data Science, Cloud

2. Robotics Engineer — ₹8-25 LPA starting
Companies: Tata, Mahindra, ISRO, Defence, Manufacturing
Skills needed: C++, ROS, Computer Vision, Mechanical basics

3. Computer Vision Engineer — ₹10-30 LPA starting
Companies: Ola, Uber, Autonomous vehicle startups
Skills needed: OpenCV, Deep Learning, Camera systems

4. AI Research Scientist — ₹20-80 LPA (with Masters)
Companies: Research labs, IITs, Google Brain
Path: Strong math + CS fundamentals + Research papers

5. EdTech AI Specialist — Growing rapidly
Companies: BYJU's, Unacademy, newer EdTech startups
Skills: AI + Education domain knowledge

FOR STUDENTS IN SCHOOL RIGHT NOW:
• Grade 6-8: Focus on AI Foundations + Coding
• Grade 9-10: Python + Robotics seriously
• Grade 11-12: Projects + Competitions + Internships
• After 12th: B.Tech CS/AI/Robotics at good college

ROBAMO ADVANTAGE:
Students who complete our advanced courses have:
• Portfolio of 5+ real projects
• Competition wins to show
• Certificate with industry recognition
• Network of peers and mentors

Start early. The students who begin at Grade 6 have 6 years of experience by the time they enter college. That's the real advantage.`,
       11, '🚀', 'b3'],

      ['STEM Education ka Future India mein — 2025 Report',
       'Education',
       'India mein STEM education rapidly evolve ho rahi hai. NEP 2020, AI Mission, aur global competitions — yeh sab mil ke ek unique opportunity create kar rahe hain Indian students ke liye. Kya hai picture, kya hai opportunities?',
       `India mein STEM education ek inflection point pe hai. Samajhte hain kya ho raha hai aur students kaise benefit kar sakte hain.

NEP 2020 KA IMPACT:
National Education Policy 2020 ne formally coding aur AI ko school curriculum mein shamil kiya hai. Class 6 se computational thinking mandatory hai. Yeh major shift hai — 5 saal pehle coding "extra" tha, aaj yeh core subject hai.

GOVERNMENT INITIATIVES:
• Atal Tinkering Labs — 10,000+ schools mein
• AI for India — free online courses
• National AI Mission — ₹10,000 crore investment
• PM SHRI Schools — technology-forward infrastructure

COMPETITION ECOSYSTEM:
India ab global robotics competitions mein seriously compete kar raha hai:
• WRO (World Robotics Olympiad) — India consistently top 10
• FLL (FIRST LEGO League) — growing participation
• CBSE Science Exhibition — AI projects dominating
• Smart India Hackathon — largest student hackathon globally

WHAT STUDENTS SHOULD DO NOW:
1. Don't wait for school — start learning outside school
2. Join a structured program like ROBAMO
3. Participate in competitions — even losing teaches more than not trying
4. Build a portfolio — real projects, not just certificates
5. Find a community — learn with peers

ROBAMO ka role is ecosystem mein clear hai — bridge the gap between school curriculum aur industry requirements. Jab student school finish karta hai, woh industry-ready hona chahiye, sirf exam-ready nahi.

India 2030 mein technology superpower ban sakta hai — lekin sirf tabhi jab aaj ke students sahi tools aur guidance ke saath taiyar ho jayein.`,
       9, '🇮🇳', 'b1'],

      ['Arduino se Kya Kya Bana Sakte Hain? — 20 Amazing Project Ideas',
       'Projects',
       'Arduino ek magical tool hai — iske saath aap almost kuch bhi bana sakte ho! Simple LED blinking se lekar smart home automation tak. Yahan hain 20 projects jo ROBAMO students ne actually banaye hain.',
       `Arduino ek microcontroller board hai jo code ko physical world se connect karta hai. Yahan hain 20 amazing projects:

BEGINNER PROJECTS (Grade 6-8):
1. LED Traffic Light — basic programming + LEDs
2. Distance Measuring Ruler — ultrasonic sensor
3. Temperature Monitor — DHT11 sensor + LCD display
4. Motion-Triggered Alarm — PIR sensor
5. Plant Water Reminder — soil moisture sensor + buzzer

INTERMEDIATE PROJECTS (Grade 8-10):
6. Line Following Robot — IR sensors + motors
7. Obstacle Avoiding Robot — ultrasonic + servo
8. Bluetooth Controlled Car — HC-05 module
9. Digital Lock — keypad + servo motor
10. Weather Station — multiple sensors + SD card logging

ADVANCED PROJECTS (Grade 10-12):
11. Smart Irrigation System — soil sensor + relay + water pump
12. Face Detection Robot — camera + Raspberry Pi + Arduino
13. Robotic Arm — multiple servos + inverse kinematics
14. Autonomous Drone — flight controller + GPS
15. RFID Attendance System — RFID reader + database

COMPETITION-WORTHY PROJECTS:
16. AI-Powered Waste Sorter — ML model + robot
17. Sign Language Translator — flex sensors + ML
18. Agricultural Robot — GPS + computer vision
19. Medical Assistant Robot — vitals monitoring + AI
20. Smart Classroom System — multiple sensors + IoT + AI

Har project ke liye ROBAMO ke Arduino Robotics aur Robotics Pro courses mein detailed tutorials hain. Components list, code, assembly guide — sab kuch.

Kaun sa project banana chahte ho? WhatsApp pe batao — guidance denge!`,
       12, '⚡', 'b2'],

      ['Machine Learning Kaise Seekhein Bina Math se Dare? — Beginner Guide',
       'Machine Learning',
       'ML sunke bohot log darte hain — statistics, calculus, linear algebra... magar actually beginners ke liye ML sikhna utna mushkil nahi hai. Iss guide mein jaanein ki kahan se start karein aur kaise progress karein.',
       `Machine Learning ka naam sunke log immediately equations aur formulas sochne lagte hain. Magar practical ML seekhne ke liye zyada math ki zaroorat nahi hai — especially beginners ke liye.

MYTH VS REALITY:

Myth: ML ke liye advanced calculus chahiye
Reality: Basic algebra aur statistics kaafi hai starting ke liye. Deep math tab chahiye jab aap research level jaana chahte ho.

Myth: ML sirf engineers ke liye hai
Reality: Doctors, teachers, farmers, businessmen — sab ML use karte hain aaj. Domain knowledge + basic ML = powerful combination.

BEGINNER PATH:

Step 1 — Python seekho (2-4 weeks)
Variables, lists, loops, functions. Bas itna. Koi OOP nahi chahiye shuru mein.

Step 2 — Data explore karo (2 weeks)
Pandas se CSV files load karo. Matplotlib se graphs banao. Real data se khelna ML ki asli duniya hai.

Step 3 — Simple models (4 weeks)
scikit-learn library se start karo. Decision Trees, KNN, Linear Regression. Code 10 lines mein. Koi math samjhe bina bhi kaam karta hai.

Step 4 — Projects banao (ongoing)
Kaggle pe beginner competitions join karo. Titanic dataset, house price prediction. Real problems, real data.

Step 5 — Tab math seekho (as needed)
Jab aap samajhna chahenge KYU model aise behave kar raha hai — tab math natural lagega.

ROBAMO ka Machine Learning course exactly iss approach follow karta hai. Day 1 se code likhna, Day 1 se projects banana. Math concepts tab introduce hoti hain jab practically relevant hoti hain.

Fear mat karo. Curiosity rakho. Start karo.`,
       10, '🧮', 'b3'],

      ['India ke Top Robotics Competitions — Complete Guide 2025',
       'Competitions',
       'India mein kaun se robotics competitions hain? Kaise register karein? Kya prepare karein? Yeh complete guide sabke liye hai — students, parents aur schools ke liye.',
       `Competitions mein participate karna ROBAMO experience ka ek important part hai. Yahan hai India ke top competitions ki complete guide:

SCHOOL LEVEL COMPETITIONS:

1. CBSE Science Exhibition
• Who: All CBSE schools
• Level: School → District → National
• Category: Innovation, Social Impact, AI/Robotics
• Prize: Certificates, trophies, cash
• Prep time needed: 3-4 months

2. Atal Tinkering Marathon
• Organized by: NITI Aayog
• Who: Schools with ATL labs (aur ROBAMO students)
• Focus: Innovation + social problem solving
• Prize: Up to ₹10 lakhs for top projects
• Registration: atalmarathin.gov.in

NATIONAL COMPETITIONS:

3. WRO India (World Robotics Olympiad)
• Age: 8-25 years
• Categories: Regular, Open, Future Innovators
• Top teams go to World Championship
• ROBAMO students participate every year

4. Smart India Hackathon
• Age: College + senior school
• Government problem statements
• 36-hour hackathon format
• Great for college applications

5. Robotics Olympiad India
• Multiple age categories
• Simulation + physical robot events
• Growing prize pool

INTERNATIONAL OPPORTUNITIES:

6. FLL (FIRST LEGO League) — ROBAMO team participates
7. International Physics Olympiad — theory based
8. Google Science Fair — research projects

ROBAMO COMPETITION SUPPORT:
• Dedicated competition coaching
• Mock competitions
• Kit sponsorship for top teams
• Travel support for nationals

Registration links aur deadlines — WhatsApp pe message karo ya website pe check karo. Hum sab timely notification dete hain.`,
       8, '🥇', 'b1'],
    ].forEach(b => bi.run(...b));
    console.log('✅ Blog posts seeded');
  }

  // SHOWCASE PROJECTS
  const showCount = db.prepare('SELECT COUNT(*) as cnt FROM showcase_projects').get().cnt;
  if (showCount === 0) {
    const si = db.prepare('INSERT INTO showcase_projects (title,student_name,grade,city,category,description,emoji,bg_class,is_featured) VALUES (?,?,?,?,?,?,?,?,?)');
    [
      ['Smart Irrigation Robot','Arjun Mehta','Grade 10','Jaipur','Robotics',
       'Arduino-based robot that monitors soil moisture and automatically waters plants. Won state-level prize.','🌱','bg1',1],
      ['AI Waste Sorter','Priya Verma','Grade 9','Delhi','AI/ML',
       'Machine learning model + conveyor belt robot that sorts plastic, paper and metal automatically.','♻️','bg2',1],
      ['Sign Language Translator','Ravi Kumar','Grade 11','Chennai','AI/ML',
       'Flex sensor glove + ML model that translates hand gestures to text and speech in real time.','🤟','bg3',1],
      ['Line Following Race Car','Team Robocraft','Grade 8','Pune','Robotics',
       'High-speed Arduino line follower with PID control. Won WRO India regional championship.','🏎️','bg1',1],
      ['COVID Safety Robot','Sneha Patel','Grade 10','Mumbai','Innovation',
       'Temperature screening + mask detection robot deployed at school entrance during pandemic.','🤖','bg2',0],
      ['AI Music Generator','Kabir Singh','Grade 12','Gurugram','AI/ML',
       'LSTM neural network trained on Indian classical music that generates new ragas.','🎵','bg3',0],
      ['Smart Classroom System','Team TechEd','Grade 11','Hyderabad','IoT',
       'Automated attendance, AC control, projector management using sensors + ML. Installed in 3 classrooms.','🏫','bg1',0],
      ['Earthquake Early Warning','Ananya Joshi','Grade 9','Ahmedabad','Innovation',
       'Vibration sensors + ML model that detects earthquake patterns and sends mobile alerts.','🌍','bg2',0],
      ['Robotic Prosthetic Arm','Rohit Sharma','Grade 12','Bangalore','Robotics',
       'EMG sensor-based prosthetic arm that responds to muscle signals. NIT Bangalore collaboration.','💪','bg3',1],
      ['AI Crop Doctor','Village Youth Team','Grade 10','Lucknow','Agriculture AI',
       'Phone camera + ML model that identifies crop diseases from leaf photos. Used by local farmers.','🌾','bg1',0],
      ['Autonomous Delivery Bot','ROBAMO Pro Batch','Grade 11-12','Delhi',
       'Robotics','GPS + computer vision delivery robot that navigates college campus autonomously.','📦','bg2',1],
      ['Facial Expression AI','Divya Nair','Grade 10','Kochi','AI/ML',
       'Deep learning model that detects emotions from facial expressions for mental health monitoring.','😊','bg3',0],
    ].forEach(s => si.run(...s));
    console.log('✅ Showcase seeded');
  }

  // DOWNLOADS
  const dlCount = db.prepare('SELECT COUNT(*) as cnt FROM downloads').get().cnt;
  if (dlCount === 0) {
    const di = db.prepare('INSERT INTO downloads (title,description,emoji) VALUES (?,?,?)');
    [
      ['ROBAMO Complete Course Brochure 2025','All courses, fees, curriculum overview aur enrollment process — 12-page PDF','📚'],
      ['Grade 1-5 Curriculum Guide','Detailed Robotics Spark aur Scratch & Code syllabus for junior students','🎓'],
      ['Grade 6-8 Curriculum Guide','AI Foundations aur Arduino Robotics complete module breakdown','🔧'],
      ['Grade 9-12 Curriculum Guide','Robotics Pro aur ML course detailed curriculum with project list','🦾'],
      ['School Partnership Proposal','Benefits, pricing structure aur implementation timeline for school partners','🏫'],
      ['Robotics Competition Preparation Handbook','WRO, CBSE, Atal Marathon — preparation guide compiled by ROBAMO winners','🏆'],
      ['Parent FAQ Guide','Aapke sab sawaalon ke jawab — fees, schedule, results, testimonials','👨‍👩‍👧'],
      ['AI Career Roadmap Poster','Print karke wall pe lagao — age-wise AI career path visual guide','🚀'],
    ].forEach(d => di.run(...d));
    console.log('✅ Downloads seeded');
  }
}

initializeDB();
module.exports = db;
