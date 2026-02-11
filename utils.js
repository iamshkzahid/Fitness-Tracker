(function(global) {

     function safeParse(s, fallback) { try { return JSON.parse(s); } catch (e) { return fallback; } }

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

     function escapeHtml(unsafe) {
          if (unsafe === null || unsafe === undefined) return '';
          return String(unsafe)
               .replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;')
               .replace(/"/g, '&quot;')
               .replace(/'/g, '&#039;');
     }

     function renderRecentActivity(activityTbody) {
          if (!activityTbody) return;
          // clear all rows
          activityTbody.innerHTML = '';
          const workouts = storage.get('workouts', []);
          if (!Array.isArray(workouts) || workouts.length === 0) {

               const tr = document.createElement('tr');
               tr.innerHTML = `<td colspan="5" style="opacity:.7; padding:20px 24px;">No workouts logged yet. Use the 'Add Workout' form above.</td>`;
               activityTbody.appendChild(tr);
               return;
          }

          const recent = workouts.slice().reverse();
          recent.forEach(w => {
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
          });
     }

     global.FitnessUtils = {
          safeParse,
          storage,
          escapeHtml,
          renderRecentActivity
     };

     if (typeof module !== 'undefined' && module.exports) {
          module.exports = global.FitnessUtils;
     }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
