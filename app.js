
(function () {
     // helper
     function $(sel, root = document) { return root.querySelector(sel); }
     function $$(sel, root = document) { return Array.from((root || document).querySelectorAll(sel)); }
     function safeParse(s, fallback) { try { return JSON.parse(s); } catch (e) { return fallback; } }

     if (!($('#addWorkoutBtn') || $('.activity-table'))) return;

     // ===== Dynamic Welcome Username =====
     const usernameSpan = document.getElementById("dashboard-username");
     const currentUser = JSON.parse(localStorage.getItem("currentUser"));

     if (usernameSpan && currentUser && currentUser.name) {
          usernameSpan.textContent = currentUser.name;
     }


     // ===== storage helpers =====
     const storage = {
          get(key, fallback) {
               const raw = localStorage.getItem(key);
               if (!raw) return fallback;
               return safeParse(raw, fallback);
          },
          set(key, val) {
               localStorage.setItem(key, JSON.stringify(val));
          },
          push(key, item) {
               const arr = storage.get(key, []);
               arr.push(item);
               storage.set(key, arr);
          }
     };

     // ===== Elements =====
     const nameIn = $('#workoutName');
     const durIn = $('#workoutDuration');
     const calIn = $('#workoutCalories');
     const addBtn = $('#addWorkoutBtn');

     const activityTable = document.querySelector('.activity-table');
     const activityTbody = activityTable ? activityTable.querySelector('tbody') : null;

     
     const statValues = $$('.stat-card .stat-value');

     // BMI UI
     const heightEl = $('#height');
     const weightEl = $('#weight');
     const calcBmiBtn = $('#calcBMI');
     const bmiResultEl = $('#bmiResult');
     const bmiCategoryEl = $('#bmiCategory');

     // ===== Functions =====
     function renderRecentActivity() {
          if (!activityTbody) return;
          // clear all rows
          activityTbody.innerHTML = '';
          const workouts = storage.get('workouts', []);
          if (!workouts || workouts.length === 0) {
              
               const tr = document.createElement('tr');
               tr.innerHTML = `<td colspan="5" style="opacity:.7; padding:20px 24px;">No workouts logged yet. Use the 'Add Workout' form above.</td>`;
               activityTbody.appendChild(tr);
               return;
          }

          for (let i = workouts.length - 1; i >= 0; i--) {
               const w = workouts[i];
               const tr = document.createElement('tr');
               const dateStr = w.ts ? new Date(w.ts).toLocaleString() : 'Unknown';
               const duration = w.duration ? `${w.duration} min` : '-';
               const calories = w.calories ? `${w.calories} kcal` : '-';
               tr.innerHTML = `
        <td>
          <div class="activity-name">
            <div class="activity-icon icon-blue"><span class="material-symbols-outlined" style="font-size:16px">fitness_center</span></div>
            ${escapeHtml(w.name)}
          </div>
        </td>
        <td>${escapeHtml(dateStr)}</td>
        <td>${escapeHtml(duration)}</td>
        <td class="text-primary">${escapeHtml(calories)}</td>
        <td class="text-right"><span class="status-badge">COMPLETED</span></td>
      `;
               activityTbody.appendChild(tr);
          }
     }

     function updateStatCards() {
          const workouts = storage.get('workouts', []);
          // calories total
          const totalCalories = workouts.reduce((s, w) => s + (Number(w.calories) || 0), 0);
          // active minutes total
          const totalMinutes = workouts.reduce((s, w) => s + (Number(w.duration) || 0), 0);
          // average heart rate – we don't have HR stored; keep UI unchanged if no data
          const avgHR = storage.get('avgHR', null); 
        
          const water = storage.get('waterToday', null);

          if (statValues && statValues.length >= 4) {
               statValues[0].textContent = `${totalCalories.toLocaleString()} `;
               statValues[0].querySelector && statValues[0].querySelector('.stat-unit') || null;
               statValues[1].textContent = `${totalMinutes} `;
               statValues[2].textContent = avgHR ? `${avgHR} ` : statValues[2].textContent; 
               statValues[3].textContent = water ? `${water} L` : statValues[3].textContent; 
          } else {
               const calEl = document.querySelector('.stat-card:nth-of-type(1) .stat-value');
               const minEl = document.querySelector('.stat-card:nth-of-type(2) .stat-value');
               if (calEl) calEl.textContent = `${totalCalories.toLocaleString()}`;
               if (minEl) minEl.textContent = `${totalMinutes}`;
          }
     }

     function escapeHtml(unsafe) {
          if (unsafe === null || unsafe === undefined) return '';
          return String(unsafe)
               .replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
     }

     // ===== Add workout event =====
     if (addBtn) {
          addBtn.addEventListener('click', () => {
               const name = nameIn ? nameIn.value.trim() : '';
               const duration = durIn ? Number(durIn.value) : 0;
               const calories = calIn ? Number(calIn.value) : 0;

               if (!name) {
                    alert('Enter workout name');
                    return;
               }

               const obj = { name, duration, calories, ts: Date.now() };
               storage.push('workouts', obj);

               if (nameIn) nameIn.value = '';
               if (durIn) durIn.value = '';
               if (calIn) calIn.value = '';

               renderRecentActivity();
               updateStatCards();

               alert('Workout added successfully');
          });
     }

     // ===== BMI Calculator event =====
     if (calcBmiBtn && heightEl && weightEl && bmiResultEl && bmiCategoryEl) {
          calcBmiBtn.addEventListener('click', () => {
               const h = Number(heightEl.value);
               const w = Number(weightEl.value);
               if (!h || !w) { alert('Enter valid height and weight'); return; }
               const bmi = +(w / ((h / 100) * (h / 100))).toFixed(1);
               const cat = bmi < 18.5 ? 'Underweight' : (bmi < 25 ? 'Normal' : (bmi < 30 ? 'Overweight' : 'Obese'));
               bmiResultEl.textContent = bmi;
               bmiCategoryEl.textContent = cat;
               storage.push('bmiHistory', { bmi, height: h, weight: w, ts: Date.now() });
               alert('BMI calculated and saved');
               // update dashboard widgets, if desired
               updateStatCards();
          });
     }

     // ===== Navigation safety (sidebar links already have ids in your file) =====
     ['#nav-home', '#nav-planner', '#nav-bmi', '#nav-progress', '#nav-profile', '#brand-logo'].forEach(sel => {
          const el = document.querySelector(sel);
          if (!el) return;
          el.addEventListener('click', (e) => {
               e.preventDefault();
               const map = {
                    '#nav-home': 'Dashboard.html',
                    '#nav-planner': 'Workout_Planner.html',
                    '#nav-bmi': 'BMI.html',
                    '#nav-progress': 'Progress.html',
                    '#nav-profile': 'Profile.html',
                    '#brand-logo': 'Dashboard.html'
               };
               const target = map[sel];
               if (target) location.href = target;
          });
     });

     renderRecentActivity();
     updateStatCards();

})();

/* ================================
   PROGRESS PAGE LOGIC
   ================================ */

(function () {
     if (!document.getElementById("monthly-chart-container")) return;

     const get = (k, f = []) => {
          try {
               return JSON.parse(localStorage.getItem(k)) || f;
          } catch {
               return f;
          }
     };

     const workouts = get("workouts"); 
     const bmiHistory = get("bmiHistory");

     const chartContainer = document.getElementById("monthly-chart-container");

     function renderMonthlyChart() {
          if (!chartContainer) return;

          chartContainer.innerHTML = "";

          const caloriesByDay = {};
          workouts.forEach(w => {
               const d = new Date(w.ts);
               const day = d.getDate();
               caloriesByDay[day] = (caloriesByDay[day] || 0) + (Number(w.calories) || 0);
          });

          const maxCalories = Math.max(...Object.values(caloriesByDay), 1);

          Object.keys(caloriesByDay).slice(-14).forEach(day => {
               const height = (caloriesByDay[day] / maxCalories) * 100;

               const col = document.createElement("div");
               col.className = "chart-col";
               col.innerHTML = `
        <div class="chart-bar-wrapper">
          <div class="chart-bar" style="height:${height}%"></div>
        </div>
        <span class="chart-label">${day}</span>
      `;
               chartContainer.appendChild(col);
          });
     }

     function renderMetrics() {
          const totalWorkoutsEl = document.getElementById("total-workouts-value");
          const avgDurationEl = document.getElementById("avg-duration-value");

          const totalWorkouts = workouts.length;
          const totalDuration = workouts.reduce((s, w) => s + (Number(w.duration) || 0), 0);
          const avgDuration = totalWorkouts ? Math.round(totalDuration / totalWorkouts) : 0;

          if (totalWorkoutsEl) totalWorkoutsEl.textContent = totalWorkouts;
          if (avgDurationEl) avgDurationEl.textContent = avgDuration + "m";
     }

     // ---------- Personal Bests ----------
     function renderPersonalBests() {
          const pbList = document.getElementById("personal-bests-list");
          if (!pbList) return;

          pbList.innerHTML = "";

          if (!workouts.length) {
               pbList.innerHTML = "<p style='opacity:.6'>No data yet</p>";
               return;
          }

          const longestWorkout = workouts.reduce((a, b) =>
               (b.duration || 0) > (a.duration || 0) ? b : a
          );

          const maxCalories = workouts.reduce((a, b) =>
               (b.calories || 0) > (a.calories || 0) ? b : a
          );

          const items = [
               { name: "Longest Workout", value: longestWorkout.duration + " min" },
               { name: "Max Calories Burned", value: maxCalories.calories + " kcal" }
          ];

          items.forEach(i => {
               const div = document.createElement("div");
               div.className = "pb-item";
               div.innerHTML = `
        <div class="pb-info">
          <div class="pb-icon">
            <span class="material-symbols-outlined">emoji_events</span>
          </div>
          <span class="pb-name">${i.name}</span>
        </div>
        <span class="pb-value">${i.value}</span>
      `;
               pbList.appendChild(div);
          });
     }

     // ---------- Export Report ----------
     const exportBtn = document.getElementById("export-report-btn");
     if (exportBtn) {
          exportBtn.addEventListener("click", () => {
               const report = {
                    workouts,
                    bmiHistory,
                    generatedAt: new Date().toISOString()
               };

               const blob = new Blob([JSON.stringify(report, null, 2)], {
                    type: "application/json"
               });

               const a = document.createElement("a");
               a.href = URL.createObjectURL(blob);
               a.download = "fittrack-report.json";
               a.click();
          });
     }

     renderMonthlyChart();
     renderMetrics();
     renderPersonalBests();

})();

/* ================================
   BMI PAGE LOGIC
   ================================ */

(function () {
     // Run only on BMI page
     if (!document.getElementById("bmi-calc-trigger")) return;

     const heightInput = document.getElementById("bmi-height");
     const weightInput = document.getElementById("bmi-weight");
     const calcBtn = document.getElementById("bmi-calc-trigger");

     const bmiValueEl = document.getElementById("bmi-score-text");
     const bmiCategoryEl = document.getElementById("bmi-category-label");

     const marker = document.getElementById("bmi-marker");
     const markerLabel = document.getElementById("bmi-marker-label");

     const historyBtn = document.getElementById("bmi-history-btn");

     const get = (k, f = []) => {
          try {
               return JSON.parse(localStorage.getItem(k)) || f;
          } catch {
               return f;
          }
     };

     const saveBMI = (entry) => {
          const history = get("bmiHistory");
          history.push(entry);
          localStorage.setItem("bmiHistory", JSON.stringify(history));
     };

     function getCategory(bmi) {
          if (bmi < 18.5) return { label: "Underweight", color: "#3b82f6", pos: 10 };
          if (bmi < 25) return { label: "Normal Weight", color: "#22c55e", pos: 35 };
          if (bmi < 30) return { label: "Overweight", color: "#f97316", pos: 65 };
          return { label: "Obese", color: "#ef4444", pos: 85 };
     }

     // Calculate BMI
     calcBtn.addEventListener("click", () => {
          const height = Number(heightInput.value);
          const weight = Number(weightInput.value);

          if (!height || !weight) {
               alert("Please enter valid height and weight");
               return;
          }

          const bmi = +(weight / ((height / 100) ** 2)).toFixed(1);
          const cat = getCategory(bmi);

          // Update UI
          bmiValueEl.textContent = bmi;
          bmiCategoryEl.textContent = cat.label;
          bmiCategoryEl.style.color = cat.color;
          bmiCategoryEl.style.borderColor = cat.color;
          bmiCategoryEl.style.backgroundColor = cat.color + "22";

          marker.style.left = cat.pos + "%";
          markerLabel.textContent = bmi;

          // Save history
          saveBMI({
               bmi,
               height,
               weight,
               category: cat.label,
               ts: Date.now()
          });
     });

     if (historyBtn) {
          historyBtn.addEventListener("click", () => {
               const history = get("bmiHistory");
               if (!history.length) {
                    alert("No BMI history yet");
                    return;
               }

               const last = history.slice(-5).reverse()
                    .map(h => `${h.bmi} (${h.category})`)
                    .join("\n");

               alert("Last BMI Records:\n\n" + last);
          });
     }

})();

/* ================================
   WORKOUT PLANNER PAGE LOGIC
   ================================ */

(function () {

     if (!document.getElementById("btn-plan-new")) return;

     const get = (k, f = {}) => {
          try { return JSON.parse(localStorage.getItem(k)) || f; }
          catch { return f; }
     };
     const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

     /* ---------- Calendar Day Logic ---------- */
     const days = document.querySelectorAll(".calendar-day");
     const plannerData = get("plannerData", {});

     days.forEach(day => {
          const dayId = day.id;

          if (plannerData[dayId]) {
               day.classList.add("day-has-workout");
               const indicator = day.querySelector(".day-indicator");
               if (indicator) indicator.textContent = plannerData[dayId].title;
          }

          day.addEventListener("click", () => {

               days.forEach(d => d.classList.remove("active"));
               day.classList.add("active");

               const existing = plannerData[dayId]?.title || "";
               const title = prompt("Enter workout name for this day:", existing);

               if (!title) return;

               plannerData[dayId] = {
                    title,
                    ts: Date.now()
               };

               set("plannerData", plannerData);

               day.classList.add("day-has-workout");
               const indicator = day.querySelector(".day-indicator");
               if (indicator) indicator.textContent = title;
          });
     });

     const exerciseInputs = document.querySelectorAll(".mini-input");
     const exerciseData = get("exerciseData", {});

     exerciseInputs.forEach(input => {
          const key = input.id;

          if (exerciseData[key] !== undefined) {
               input.value = exerciseData[key];
          }

          // Save on change
          input.addEventListener("change", () => {
               exerciseData[key] = input.value;
               set("exerciseData", exerciseData);
          });
     });

     /* ---------- Plan New Workout Button ---------- */
     const planBtn = document.getElementById("btn-plan-new");

     planBtn.addEventListener("click", () => {
          const name = prompt("Workout title (e.g. Push Day):");
          const type = prompt("Workout type (Strength/Cardio/Flexibility):");
          const duration = prompt("Estimated duration (mins):");

          if (!name || !type || !duration) return;

          const templates = get("workoutTemplates", []);
          templates.push({
               name,
               type,
               duration,
               ts: Date.now()
          });

          set("workoutTemplates", templates);

          alert("Workout plan saved.\n(For assignment purpose)");
     });

})();

/* ================================
   PROFILE PAGE LOGIC
   ================================ */

(function () {

     if (!document.getElementById("btn-edit-profile")) return;

     const get = (k, f = {}) => {
          try { return JSON.parse(localStorage.getItem(k)) || f; }
          catch { return f; }
     };
     const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

     const nameEl = document.getElementById("profile-name-display");

     const emailEl = document.getElementById("email-input");
     const ageEl = document.getElementById("age-input");
     const heightEl = document.getElementById("height-input-profile");
     const weightEl = document.getElementById("weight-input");
     const locationEl = document.getElementById("location-input");

     const editBtn = document.getElementById("btn-edit-profile");
     const logoutBtn = document.getElementById("btn-logout");

     const notifToggle = document.getElementById("notifications-toggle");
     const publicToggle = document.getElementById("public-profile-toggle");
     const unitsSelect = document.getElementById("units-system-select");
     const darkModeToggle = document.getElementById("dark-mode-toggle");

     const profile = get("profileData", {
          name: "Alex Log.",
          email: "alex.log@example.com",
          age: "28 years",
          height: "175 cm",
          weight: "70 kg",
          location: "San Francisco, CA"
     });

     nameEl.textContent = profile.name;
     emailEl.textContent = profile.email;
     ageEl.textContent = profile.age;
     heightEl.textContent = profile.height;
     weightEl.textContent = profile.weight;
     locationEl.textContent = profile.location;

     const settings = get("profileSettings", {
          notifications: true,
          publicProfile: false,
          units: "Metric (kg, cm)",
          darkMode: true
     });

     notifToggle.checked = settings.notifications;
     publicToggle.checked = settings.publicProfile;
     unitsSelect.value = settings.units;
     darkModeToggle.checked = settings.darkMode;

     if (settings.darkMode) {
          document.body.classList.add("dark-mode");
     } else {
          document.body.classList.remove("dark-mode");
     }


     editBtn.addEventListener("click", () => {
          const name = prompt("Full Name:", profile.name);
          if (!name) return;

          const email = prompt("Email:", profile.email);
          const age = prompt("Age:", profile.age);
          const height = prompt("Height:", profile.height);
          const weight = prompt("Weight:", profile.weight);
          const location = prompt("Location:", profile.location);

          profile.name = name;
          profile.email = email || profile.email;
          profile.age = age || profile.age;
          profile.height = height || profile.height;
          profile.weight = weight || profile.weight;
          profile.location = location || profile.location;

          set("profileData", profile);

          nameEl.textContent = profile.name;
          emailEl.textContent = profile.email;
          ageEl.textContent = profile.age;
          heightEl.textContent = profile.height;
          weightEl.textContent = profile.weight;
          locationEl.textContent = profile.location;

          alert("Profile updated successfully");
     });

     function saveSettings() {
          const isDark = darkModeToggle.checked;

          set("profileSettings", {
               notifications: notifToggle.checked,
               publicProfile: publicToggle.checked,
               units: unitsSelect.value,
               darkMode: isDark
          });

          document.body.classList.toggle("dark-mode", isDark);
     }


     notifToggle.addEventListener("change", saveSettings);
     publicToggle.addEventListener("change", saveSettings);
     unitsSelect.addEventListener("change", saveSettings);
     darkModeToggle.addEventListener("change", saveSettings);

     /* ---------- Logout ---------- */
     logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("currentUser");
          alert("Logged out successfully");
          window.location.href = "Login.html";
     });

})();

/* ================================
   LOGIN / SIGNUP PAGE LOGIC
   ================================ */

(function () {

     if (!document.getElementById("auth-form")) return;

     const form = document.getElementById("auth-form");
     const loginTab = document.getElementById("login-tab-btn");
     const signupTab = document.getElementById("signup-tab-btn");

     const nameInput = document.getElementById("auth-name");
     const emailInput = document.getElementById("email-input");
     const passwordInput = document.getElementById("password-input");

     const submitBtn = document.getElementById("sign-in-submit-btn");

     const googleBtn = document.getElementById("google-login-btn");
     const facebookBtn = document.getElementById("facebook-login-btn");

     const get = (k, f = []) => {
          try { return JSON.parse(localStorage.getItem(k)) || f; }
          catch { return f; }
     };
     const set = (k, v) => localStorage.setItem(k, JSON.stringify(v));

     form.addEventListener("submit", () => {
          const isSignup = signupTab.checked;

          const email = emailInput.value.trim();
          const password = passwordInput.value.trim();

          if (!email || !password) {
               alert("Email and password are required");
               return;
          }

          let users = get("users", []);

          if (isSignup) {
               // SIGN UP
               const name = nameInput.value.trim();
               if (!name) {
                    alert("Name is required for signup");
                    return;
               }

               const exists = users.find(u => u.email === email);
               if (exists) {
                    alert("User already exists. Please login.");
                    return;
               }

               const newUser = {
                    name,
                    email,
                    password, 
                    createdAt: Date.now()
               };

               users.push(newUser);
               set("users", users);
               set("currentUser", newUser);

               set("profileData", {
                    name: newUser.name,
                    email: newUser.email,
                    age: "—",
                    height: "—",
                    weight: "—",
                    location: "—"
               });

               alert("Account created successfully");
               window.location.href = "Dashboard.html";

          } else {
               const user = users.find(
                    u => u.email === email && u.password === password
               );

               if (!user) {
                    alert("Invalid email or password");
                    return;
               }

               set("currentUser", user);
               alert("Login successful");
               window.location.href = "Dashboard.html";
          }
     });

     googleBtn.addEventListener("click", () => {
          alert("Google login is mocked for this project");
     });

     facebookBtn.addEventListener("click", () => {
          alert("Facebook login is mocked for this project");
     });

})();

