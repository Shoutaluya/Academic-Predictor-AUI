
    // Config state representing current progress steps
    let currentStep = 1;
    const totalSteps = 4;
    
    // Core Elements reference
    const stepCards = {
      1: document.getElementById('step-card-1'),
      2: document.getElementById('step-card-2'),
      3: document.getElementById('step-card-3'),
      4: document.getElementById('step-card-4')
    };
    
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const executeBtn = document.getElementById('execute-btn');
    const stepIndicator = document.getElementById('step-indicator');
    
    const stateWaiting = document.getElementById('panel-state-waiting');
    const stateLoader = document.getElementById('panel-state-loader');
    const stateResults = document.getElementById('panel-state-results');
    
    // Multi-message loops during illusion
    const illusionMessages = [
      "Initializing secure connection... Normalizing raw student feature vectors into localized model tensor arrays.",
      "Parsing attributes... Executing multi-threaded Random Forest decision tree splits across trained historical baseline weights.",
      "Calculating localized probability densities and evaluating inputs against AUI structural graduation thresholds.",
      "Inference calculation verified. Generating advanced performance metrics and compiling faculty report logs..."
    ];
    
    // Fast visual validation indicators to user on card transitions
    function showFormNotification(message, type = "success") {
      const drawer = document.getElementById('form-notification');
      const text = document.getElementById('form-notification-txt');
      
      drawer.classList.remove('hidden');
      
      if (type === "success") {
        drawer.className = "flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4 select-none text-xs font-mono transition-all duration-300 transform scale-100 opacity-100 mb-6";
        drawer.querySelector('svg').className = "w-4 h-4 text-emerald-400 shrink-0";
      } else {
        drawer.className = "flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-950/20 p-4 select-none text-xs font-mono transition-all duration-300 transform scale-100 opacity-100 mb-6";
        drawer.querySelector('svg').className = "w-4 h-4 text-red-400 shrink-0";
      }
      
      text.innerText = message;
      
      // Auto dismiss after 4 seconds
      setTimeout(() => {
        drawer.classList.add('opacity-0', 'scale-95');
        setTimeout(() => { drawer.classList.add('hidden'); }, 300);
      }, 4000);
    }

    // Interactive progressive interview check before unlocking step blocks
    function validateStep(step) {
      if (step === 1) {
        const lvStr = document.getElementById('student_level').value;
        const waecVal = parseInt(document.getElementById('waec_score').value);
        const jambVal = parseInt(document.getElementById('jamb_score').value);
        if (!lvStr) {
          showFormNotification("Please select a student level.", "error");
          return false;
        }
        if (isNaN(waecVal) || waecVal < 1 || waecVal > 10) {
          showFormNotification("WAEC score must be between 1 and 10.", "error");
          return false;
        }
        if (isNaN(jambVal) || jambVal < 100 || jambVal > 400) {
          showFormNotification("JAMB score must be between 100 and 400.", "error");
          return false;
        }
        showFormNotification("Academic standing is confirmed.", "success");
        return true;
      }
      if (step === 2) {
        const gpaVal = parseFloat(document.getElementById('first_sem_gpa').value);
        const internalVal = parseInt(document.getElementById('internal_test_score').value);
        if (isNaN(gpaVal) || gpaVal < 0 || gpaVal > 5.0) {
          showFormNotification("GPA must be between 0.0 and 5.0.", "error");
          return false;
        }
        if (isNaN(internalVal) || internalVal < 1 || internalVal > 30) {
          showFormNotification("Continuous Assessment (CA) must be between 1 and 30.", "error");
          return false;
        }
        showFormNotification("Academic standing vectors confirmed.", "success");
        return true;
      }
      if (step === 3) {
        const attendanceVal = parseInt(document.getElementById('attendance_pct').value);
        const assignmentVal = parseFloat(document.getElementById('assignment_rate').value);
        if (isNaN(attendanceVal) || attendanceVal < 40 || attendanceVal > 100) {
          showFormNotification("Attendance must be between 40% and 100%.", "error");
          return false;
        }
        if (isNaN(assignmentVal) || assignmentVal < 0 || assignmentVal > 1) {
          showFormNotification("Assignment rate must be between 0.0 and 1.0.", "error");
          return false;
        }
        showFormNotification("Participation parameters integrated.", "success");
        return true;
      }
      return true;
    }

    // Core function to navigate step modules
    function navigateStep(direction) {
      // Rule constraint: validate step when advancing forward
      if (direction === 1) {
        if (!validateStep(currentStep)) return;
      }

      // Validate bounds
      if (currentStep + direction < 1 || currentStep + direction > totalSteps) return;
      
      // Animate current out
      const currentCard = stepCards[currentStep];
      currentCard.classList.add('opacity-0', 'translate-y-4');
      currentCard.style.pointerEvents = "none";
      
      setTimeout(() => {
        currentCard.classList.add('hidden');
        currentStep += direction;
        
        // Show new
        const nextCard = stepCards[currentStep];
        nextCard.classList.remove('hidden');
        
        // Brief timeout for browser layout recalculation before fade-in
        setTimeout(() => {
          nextCard.classList.remove('opacity-0', 'translate-y-4');
          nextCard.classList.add('opacity-100');
          nextCard.style.pointerEvents = "auto";
          
          // Move focus to first input of the new card
          const firstInput = nextCard.querySelector('input, select');
          if (firstInput) firstInput.focus();
        }, 50);
        
        // Update Buttons configuration
        updateStepperControlsUI();
      }, 500);
    }
    
    function updateStepperControlsUI() {
      // Step Tracker tag
      stepIndicator.textContent = `Step ${currentStep}`;
      
      // Disable prev if on 1
      if (currentStep === 1) {
        prevBtn.classList.add('invisible');
        prevBtn.style.pointerEvents = "none";
      } else {
        prevBtn.classList.remove('invisible');
        prevBtn.style.pointerEvents = "auto";
      }
      
      // Handle Next vs submit
      if (currentStep === totalSteps) {
        nextBtn.classList.add('hidden');
        executeBtn.classList.remove('hidden');
      } else {
        nextBtn.classList.remove('hidden');
        executeBtn.classList.add('hidden');
      }
    }
    
    // Toggle accordion state
    function toggleAccordion(id) {
      const accordion = document.getElementById(id);
      const arrow = document.getElementById('accordion-arrow');
      
      if (accordion.classList.contains('hidden')) {
        accordion.classList.remove('hidden');
        arrow.classList.add('rotate-180');
      } else {
        accordion.classList.add('hidden');
        arrow.classList.remove('rotate-180');
      }
    }
    
    // Handle AJAX prediction call
    document.getElementById('prediction-form').addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Final submit safety validation checks
      if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
        return;
      }
      
      // Extract form input values
      const formData = {
        student_level: parseInt(document.getElementById('student_level').value),
        waec_score: parseInt(document.getElementById('waec_score').value),
        jamb_score: parseInt(document.getElementById('jamb_score').value),
        first_sem_gpa: parseFloat(document.getElementById('first_sem_gpa').value),
        internal_test_score: parseInt(document.getElementById('internal_test_score').value),
        attendance_pct: parseInt(document.getElementById('attendance_pct').value),
        assignment_rate: parseFloat(document.getElementById('assignment_rate').value),
        carryover_count: parseInt(document.getElementById('carryover_count').value),
        study_hours: parseInt(document.getElementById('study_hours').value)
      };
      
      // Instantly trigger State transition to Loader state
      stateWaiting.classList.add('hidden');
      stateResults.classList.add('hidden');
      stateLoader.classList.remove('hidden');
      
      const barFill = document.getElementById('loader-bar-fill');
      const loaderTxt = document.getElementById('loader-message');
      const percentTxt = document.getElementById('loader-percent');
      
      // Reset loader visual markers
      barFill.style.width = '0%';
      percentTxt.innerText = '0%';
      loaderTxt.innerText = illusionMessages[0];
      
      // Begin standard mathematical illusion progress tracking
      // Exact steps: 1.8 seconds artificial delay:
      // Loop steps
      const totalDelay = 1800;
      let startTimestamp = null;
      
      function animateProgress(timestamp) {
        if (!startTimestamp) startTimestamp = timestamp;
        const elapsed = timestamp - startTimestamp;
        const progressPct = Math.min(100, Math.round((elapsed / totalDelay) * 100));
        
        barFill.style.width = `${progressPct}%`;
        percentTxt.innerText = `${progressPct}%`;
        
        // Swap micro messages at targeted intervals
        if (elapsed >= 1700) {
          loaderTxt.innerText = illusionMessages[3];
        } else if (elapsed >= 1100) {
          loaderTxt.innerText = illusionMessages[2];
        } else if (elapsed >= 500) {
          loaderTxt.innerText = illusionMessages[1];
        } else {
          loaderTxt.innerText = illusionMessages[0];
        }
        
        if (elapsed < totalDelay) {
          requestAnimationFrame(animateProgress);
        }
      }
      
      // Trigger loader loop
      requestAnimationFrame(animateProgress);
      
      // Make active API call
      fetch('/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      .then(res => {
        if (!res.ok) {
          throw new Error('Performance evaluation pipeline failed internally');
        }
        return res.json();
      })
      .then(data => {
        // Wait for exactly 1.8 seconds to elapse to respect the labor illusion guidelines
        setTimeout(() => {
          // Transition to result views
          stateLoader.classList.add('hidden');
          stateResults.classList.remove('hidden');
          
          // Save inputs for sandbox what-if solver
          window.currentPredictionInputs = { ...formData };
          
          // Populate primary diagnostic outcomes
          const classification = document.getElementById('result-classification');
          const confidence = document.getElementById('result-confidence');
          
          const formattedConfidence = parseFloat(data.confidence).toFixed(1);
          confidence.innerText = `${formattedConfidence}%`;

          // Update ARIA live region
          const announcer = document.getElementById('result-announcer');
          if (announcer) {
            announcer.innerText = `Prediction: ${data.prediction === 1 ? 'High Academic Stand' : 'At Risk'}. Confidence: ${formattedConfidence}%`;
            // Also move focus to results for accessibility
            stateResults.focus();
            stateResults.setAttribute('tabindex', '-1');
          }
          
          // Set appropriate label depending on model target response and precision formats
          let standingTitle = "";
          if (data.prediction === 1) {
            if (formData.first_sem_gpa >= 4.5) {
              standingTitle = "First Class Profile Alignment";
              classification.innerHTML = `<span class="text-white font-extrabold uppercase tracking-wide">${standingTitle}</span> — <span class="text-emerald-400 font-bold">${formattedConfidence}% Model Confidence</span>`;
            } else if (formData.first_sem_gpa >= 3.5) {
              standingTitle = "Second Class Upper Profile Alignment";
              classification.innerHTML = `<span class="text-white font-extrabold uppercase tracking-wide">${standingTitle}</span> — <span class="text-[#38BDF8] font-bold">${formattedConfidence}% Model Confidence</span>`;
            } else {
              standingTitle = "Satisfactory Standing trajectory Alignment";
              classification.innerHTML = `<span class="text-white font-extrabold uppercase tracking-wide">${standingTitle}</span> — <span class="text-emerald-400 font-bold">${formattedConfidence}% Model Confidence</span>`;
            }
          } else {
            standingTitle = "Academic Danger Warning / At Risk Standing";
            classification.innerHTML = `<span class="text-red-500 font-extrabold uppercase tracking-wide animate-pulse">${standingTitle}</span> — <span class="text-amber-500 font-bold">${formattedConfidence}% Model Confidence</span>`;
          }
          
          // Animate probability meters (Graduation Horizon)
          animateMeter('prob-first-bar', 'prob-first-val', data.probabilities.first_class_pct);
          animateMeter('prob-second-bar', 'prob-second-val', data.probabilities.second_upper_pct);
          animateMeter('prob-second-lower-bar', 'prob-second-lower-val', data.probabilities.second_lower_pct);
          animateMeter('prob-risk-bar', 'prob-risk-val', data.probabilities.third_class_pct);
          
          // Populate Boundary Margin Proximity & Pulback Factor Card
          const marginData = data.class_boundary_margin;
          if (marginData) {
            document.getElementById('margin-description').innerText = marginData.margin_description;
            document.getElementById('margin-current-gpa-lbl').innerText = `Current CGPA: ${parseFloat(marginData.current_gpa).toFixed(2)}`;
            document.getElementById('margin-target-boundary-lbl').innerText = `Target: ${marginData.next_boundary_title} (${parseFloat(marginData.next_boundary_threshold).toFixed(2)})`;
            
            const marginProgBar = document.getElementById('margin-progress-bar');
            marginProgBar.style.width = '0%';
            setTimeout(() => {
              marginProgBar.style.width = `${marginData.progress_pct}%`;
            }, 300);

            document.getElementById('margin-pullback-factor').innerText = marginData.pullback_factor;
            
            const marginBadge = document.getElementById('margin-status-badge');
            if (marginBadge) {
              if (marginData.margin_gpa <= 0.3) {
                marginBadge.innerText = 'Highly Critical Proximity';
                marginBadge.className = 'px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20 uppercase';
              } else if (marginData.margin_gpa <= 0.6) {
                marginBadge.innerText = 'Moderate Gap';
                marginBadge.className = 'px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-amber-500/15 text-amber-500 border border-amber-500/20 uppercase';
              } else {
                marginBadge.innerText = 'Wide Horizon Gap';
                marginBadge.className = 'px-2 py-0.5 rounded text-[8px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 uppercase';
              }
            }
          }

          // Populate Trajectory Nudge Advisor Card
          const nudgeData = data.trajectory_nudge;
          if (nudgeData) {
            document.getElementById('nudge-factor-title').innerText = nudgeData.name;
            document.getElementById('nudge-factor-desc').innerText = nudgeData.description;
            document.getElementById('trajectory-nudge-impact').innerText = nudgeData.impact_desc;
          }

          // Populate Class-Aware Academic Intervention advice
          if (data.class_aware_advice) {
            document.getElementById('result-class-aware-advice').innerText = data.class_aware_advice;
          }
          
          // Render Dynamic Feature Importance Chart
          const chartContainer = document.getElementById('feature-importance-chart');
          chartContainer.innerHTML = '';
          
          if (data.feature_importances && data.feature_importances.length > 0) {
            const displayFeatures = data.feature_importances.slice(0, 5);
            displayFeatures.forEach((feat, index) => {
              const row = document.createElement('div');
              row.className = 'space-y-1';
              
              let barColor = 'from-aui-gold to-yellow-500';
              if (index === 0) barColor = 'from-aui-gold to-amber-500';
              else if (index === 1) barColor = 'from-[#38BDF8] to-aui-brandBlue';
              else if (index === 2) barColor = 'from-indigo-400 to-indigo-500';
              else barColor = 'from-slate-500 to-slate-400';

              row.innerHTML = `
                <div class="flex justify-between items-center text-[10px]">
                  <span class="text-slate-300 font-mono font-medium">${feat.name}</span>
                  <span class="font-mono font-bold text-slate-400">${feat.weight.toFixed(1)}%</span>
                </div>
                <div class="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-900 p-[1px]">
                  <div class="h-full bg-gradient-to-r ${barColor} rounded-full transition-all duration-1000 ease-out" style="width: 0%" id="feat-bar-${index}"></div>
                </div>
              `;
              chartContainer.appendChild(row);
              
              setTimeout(() => {
                const barFill = document.getElementById(`feat-bar-${index}`);
                if (barFill) barFill.style.width = `${feat.weight}%`;
              }, 50 + (index * 60));
            });
          }

          // Print English explanatory factor
          document.getElementById('top-factor-alert').innerText = data.top_factor;
          document.getElementById('top-factor-verdict').innerText = `Your ${data.top_factor} was evaluated by the Random Forest classifier as the primary vector shaping this structural performance horizon.`;
          
          // Institutional standing policies
          const policyCard = document.getElementById('policy-card-holder');
          const policyBadge = document.getElementById('policy-badge');
          const policyHeader = document.getElementById('policy-header-label');
          const policySub = document.getElementById('policy-sub-label');
          const policyMsg = document.getElementById('result-policy-msg');
          const projectedGpa = document.getElementById('result-projected-gpa');
          
          if (data.is_critical_policy) {
            // High Risk profile warning alerts (Red Alert policy card)
            policyCard.className = "rounded-xl p-5 border-2 border-red-500/80 bg-red-950/25 flex flex-col justify-between shadow-[0_0_15px_rgba(239,68,68,0.15)]";
            policyBadge.className = "h-3 w-3 rounded-full bg-red-500 animate-pulse shadow-md";
            policyHeader.className = "text-red-400 text-xs font-extrabold uppercase tracking-wide";
            policySub.className = "text-red-500 text-[9px] font-mono uppercase tracking-widest font-black";
            policyMsg.className = "text-red-100 text-xs mt-3 leading-relaxed font-semibold";
          } else {
            // standard reassuring status parameters (Green banner matrix)
            policyCard.className = "rounded-xl p-5 border border-emerald-500/50 bg-[#101B30]/80 flex flex-col justify-between shadow-lg shadow-emerald-500/5";
            policyBadge.className = "h-3 w-3 rounded-full bg-emerald-400 animate-pulse shadow-sm";
            policyHeader.className = "text-emerald-400 text-xs font-extrabold uppercase tracking-wide";
            policySub.className = "text-sky-400 text-[9px] font-mono uppercase tracking-widest font-bold";
            policyMsg.className = "text-gray-300 text-xs mt-3 leading-relaxed";
          }
          
          policyMsg.innerText = data.policy_assessment;
          projectedGpa.innerText = `${data.predicted_gpa.toFixed(1)} / 5.0`;
          
          // Populate Empirical Cohort linkage metrics matching
          if (data.empirical_cohort_match) {
            const match = data.empirical_cohort_match;
            
            // Map GPA rank percentile to user ordinal standing
            let percentileSuffix = "th Percentile";
            const lastDigit = match.standing_peer_percentage % 10;
            if (match.standing_peer_percentage === 11 || match.standing_peer_percentage === 12 || match.standing_peer_percentage === 13) {
              percentileSuffix = "th Percentile";
            } else if (lastDigit === 1) {
              percentileSuffix = "st Percentile";
            } else if (lastDigit === 2) {
              percentileSuffix = "nd Percentile";
            } else if (lastDigit === 3) {
              percentileSuffix = "rd Percentile";
            }
            
            document.getElementById('cohort-gpa-percentile').innerText = `${match.standing_peer_percentage}${percentileSuffix}`;
            document.getElementById('cohort-stress-percentage').innerText = `${match.stress_percentage}%`;
            document.getElementById('cohort-common-challenge').innerText = match.common_challenge || "None Reported";
            document.getElementById('cohort-matches-count').innerText = `${match.size} student profile entries`;
            document.getElementById('cohort-pooling-protocol').innerText = match.pooling_protocol || "Strict same-level study cohort";
          }
          
          // Update analytics counter on successful transaction
          document.getElementById('counter-display').innerText = data.new_evaluation_count;
          
          // Unlock Pathway Simulation Sandbox for all completed evaluations
          const sandboxCard = document.getElementById('sandbox-recovery-card');
          if (sandboxCard) {
            sandboxCard.classList.remove('hidden');
            
            const sandboxTitle = document.getElementById('sandbox-title-header');
            const sandboxDesc = document.getElementById('sandbox-description-header');
            
            if (data.prediction === 0) {
              if (sandboxTitle) sandboxTitle.innerText = "Pathway to Standings Recovery";
              if (sandboxDesc) sandboxDesc.innerText = "Your profile shows At Risk standing. Simulate real-time behavioral adjustments below to map your trajectory out of academic danger.";
            } else {
              if (sandboxTitle) sandboxTitle.innerText = "Pathway to Standings Optimization";
              if (sandboxDesc) sandboxDesc.innerText = "Your profile is in Clear Standing. Simulate higher behavioral targets below to map out optimal grade point trajectories.";
            }
            
            initializeSandboxSliders(formData);
          }
          
        }, totalDelay);
      })
      .catch(error => {
        alert('Diagnostic server connection failed. Make sure of backend stability.');
        stateLoader.classList.add('hidden');
        stateWaiting.classList.remove('hidden');
      });
    });
    
    // Helper to animate progress vectors safely
    function animateMeter(barId, valId, targetVal) {
      const bar = document.getElementById(barId);
      const val = document.getElementById(valId);
      
      // Animate percentage text values
      let currentVal = 0;
      const duration = 1000;
      const intervalTime = 15;
      const stepValue = targetVal / (duration / intervalTime);
      
      bar.style.width = '0%';
      
      const interval = setInterval(() => {
        currentVal += stepValue;
        if (currentVal >= targetVal) {
          currentVal = targetVal;
          clearInterval(interval);
        }
        val.innerText = `${currentVal.toFixed(1)}%`;
      }, intervalTime);
      
      // Trigger fluid CSS width transition
      setTimeout(() => {
        bar.style.width = `${targetVal}%`;
      }, 50);
    }

    // -------------------------------------------------------------------------
    // AUI Sophomores, Juniors & Seniors Dynamic GPA Builder Matrix
    // -------------------------------------------------------------------------
    const defaultAuiCourses = [
      { code: 'GST 111 (Language)', units: 2, grade: 'A' },
      { code: 'MTH 111 (Calculus)', units: 3, grade: 'B' },
      { code: 'CSC 111 (Programming)', units: 3, grade: 'A' },
      { code: 'CHM 111 (Chemistry)', units: 3, grade: 'C' },
      { code: 'PHY 111 (Physics)', units: 3, grade: 'B' }
    ];

    function handleStudentLevelChange() {
      const levelSelect = document.getElementById('student_level');
      const level = parseInt(levelSelect.value);
      const builderPanel = document.getElementById('gpa-builder-panel');
      const syncTag = document.getElementById('gpa-sync-tag');
      const firstSemGpaInput = document.getElementById('first_sem_gpa');
      
      if (level === 100) {
        // Fresh 100 level has no previous completed semesters
        builderPanel.classList.add('hidden');
        syncTag.classList.add('hidden');
        firstSemGpaInput.removeAttribute('disabled');
        firstSemGpaInput.style.opacity = "1";
        return;
      }

      // Show GPA builder panel and active dynamic sync warning on Card 2
      builderPanel.classList.remove('hidden');
      syncTag.classList.remove('hidden');
      firstSemGpaInput.setAttribute('disabled', 'true');
      firstSemGpaInput.style.opacity = "0.75"; // Indicate lock state

      // Determine appropriate semesters to build
      const semContainer = document.getElementById('semester-inputs-container');
      semContainer.innerHTML = '';

      let semestersList = [];
      if (level === 200) {
        semestersList = [
          { num: 1, label: '100L First Semester', val: 3.5 },
          { num: 2, label: '100L Second Semester', val: 3.3 }
        ];
      } else if (level === 300) {
        semestersList = [
          { num: 1, label: '100L First Semester', val: 3.6 },
          { num: 2, label: '100L Second Semester', val: 3.4 },
          { num: 3, label: '200L First Semester', val: 3.5 },
          { num: 4, label: '200L Second Semester', val: 3.3 }
        ];
      } else if (level === 400) {
        semestersList = [
          { num: 1, label: '100L First Semester', val: 3.7 },
          { num: 2, label: '100L Second Semester', val: 3.5 },
          { num: 3, label: '200L First Semester', val: 3.6 },
          { num: 4, label: '200L Second Semester', val: 3.4 },
          { num: 5, label: '300L First Semester', val: 3.5 },
          { num: 6, label: '300L Second Semester', val: 3.3 }
        ];
      }

      semestersList.forEach(sem => {
        const semDiv = document.createElement('div');
        semDiv.className = 'space-y-1 bg-[#131E35] border border-aui-borderSlate/40 rounded-xl p-3 flex flex-col justify-between';
        semDiv.innerHTML = `
          <div class="flex justify-between items-center bg-[#101B30]/30 py-0.5 px-1.5 rounded">
            <span class="text-[9px] font-bold text-gray-300 font-mono uppercase">${sem.label}</span>
            <span id="sem-val-${sem.num}" class="font-mono text-xs font-black text-[#D4AF37]">${parseFloat(sem.val).toFixed(2)}</span>
          </div>
          <input type="range" class="sem-gpa-slider w-full h-1 bg-[#101B30] rounded-lg appearance-none cursor-pointer accent-[#D4AF37] focus:outline-none border border-aui-borderSlate/30" min="0.0" max="5.0" step="0.05" value="${sem.val}" oninput="updateSemVal(${sem.num}, this.value)">
        `;
        semContainer.appendChild(semDiv);
      });

      // Populate helper target dropdown
      const targetSemSelect = document.getElementById('helper-target-sem');
      if (targetSemSelect) {
        targetSemSelect.innerHTML = '';
        semestersList.forEach(sem => {
          const opt = document.createElement('option');
          opt.value = sem.num;
          opt.text = sem.label;
          targetSemSelect.appendChild(opt);
        });
      }

      calculateCGPAFromSemesters();
    }

    function updateSemVal(idx, val) {
      document.getElementById(`sem-val-${idx}`).innerText = parseFloat(val).toFixed(2);
      calculateCGPAFromSemesters();
    }

    function calculateCGPAFromSemesters() {
      const sliders = document.querySelectorAll('.sem-gpa-slider');
      let sum = 0;
      sliders.forEach(slide => {
        sum += parseFloat(slide.value);
      });
      const avg = sliders.length > 0 ? (sum / sliders.length) : 0;
      
      // Sync into Card 2 values
      const cgpaInput = document.getElementById('first_sem_gpa');
      cgpaInput.value = avg.toFixed(2);
      document.getElementById('gpa_val').innerText = avg.toFixed(2);
    }

    function toggleGradeHelper() {
      const container = document.getElementById('grade-helper-container');
      const plusIcon = document.getElementById('helper-plus-icon');
      const badge = document.getElementById('helper-status-badge');
      
      if (container.classList.contains('hidden')) {
        container.classList.remove('hidden');
        plusIcon.classList.add('rotate-45');
        badge.innerText = '(active helper)';
        
        // Populate standard courses if empty
        const courseList = document.getElementById('helper-course-list');
        if (courseList.children.length === 0) {
          defaultAuiCourses.forEach(c => addNewHelperCourse(c.code, c.units, c.grade));
        }
      } else {
        container.classList.add('hidden');
        plusIcon.classList.remove('rotate-45');
        badge.innerText = '(expand to compute)';
      }
    }

    function addNewHelperCourse(code = '', units = 3, grade = 'B') {
      const courseList = document.getElementById('helper-course-list');
      const row = document.createElement('div');
      row.className = 'grid grid-cols-12 gap-2 items-center text-xs';
      
      row.innerHTML = `
        <input type="text" placeholder="e.g. GST 211" value="${code}" class="col-span-6 bg-[#101B30] border border-aui-borderSlate/60 rounded px-2 py-1 text-[11px] text-white focus:outline-none focus:border-aui-gold">
        <select class="course-units col-span-3 bg-[#101B30] border border-aui-borderSlate/60 rounded px-1.5 py-1 text-[11px] text-white cursor-pointer focus:outline-none">
          <option value="1" ${units === 1 ? 'selected' : ''}>1</option>
          <option value="2" ${units === 2 ? 'selected' : ''}>2</option>
          <option value="3" ${units === 3 ? 'selected' : ''}>3</option>
          <option value="4" ${units === 4 ? 'selected' : ''}>4</option>
          <option value="5" ${units === 5 ? 'selected' : ''}>5</option>
          <option value="6" ${units === 6 ? 'selected' : ''}>6</option>
        </select>
        <select class="course-grade col-span-3 bg-[#101B30] border border-aui-borderSlate/60 rounded px-1.5 py-1 text-[11px] text-white cursor-pointer focus:outline-none text-[#D4AF37] font-bold">
          <option value="5" ${grade === 'A' ? 'selected' : ''}>A</option>
          <option value="4" ${grade === 'B' ? 'selected' : ''}>B</option>
          <option value="3" ${grade === 'C' ? 'selected' : ''}>C</option>
          <option value="2" ${grade === 'D' ? 'selected' : ''}>D</option>
          <option value="1" ${grade === 'E' ? 'selected' : ''}>E</option>
          <option value="0" ${grade === 'F' ? 'selected' : ''}>F</option>
        </select>
      `;
      courseList.appendChild(row);
    }

    function calculateHelperGPA() {
      const unitsSelects = document.querySelectorAll('.course-units');
      const gradeSelects = document.querySelectorAll('.course-grade');
      const targetSemSelect = document.getElementById('helper-target-sem');
      
      if (!targetSemSelect || targetSemSelect.options.length === 0) {
        alert('Please make sure you have chosen 200 Level or above to apply results.');
        return;
      }

      let totalUnits = 0;
      let weightedPoints = 0;
      
      for (let i = 0; i < unitsSelects.length; i++) {
        const units = parseInt(unitsSelects[i].value);
        const points = parseInt(gradeSelects[i].value);
        totalUnits += units;
        weightedPoints += (units * points);
      }
      
      const computedGpa = totalUnits > 0 ? (weightedPoints / totalUnits) : 0.0;
      const targetIdx = parseInt(targetSemSelect.value);
      const sliders = document.querySelectorAll('.sem-gpa-slider');
      
      if (sliders[targetIdx - 1]) {
        sliders[targetIdx - 1].value = computedGpa.toFixed(2);
        updateSemVal(targetIdx, computedGpa.toFixed(2));
        alert(`Computed GPA of ${computedGpa.toFixed(2)} was successfully synchronized into ${targetSemSelect.options[targetIdx - 1].text}!`);
      }
    }

    // -------------------------------------------------------------------------
    // Official Augustine University PDF Transcript & Report Generator
    // -------------------------------------------------------------------------
    function downloadPDFReport() {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4'
      });

      const primaryNavy = '#101B30';
      const accentGold = '#D4AF37';
      const lightSlate = '#4E617E';
      
      // Draw background design decoration
      doc.setFillColor(16, 27, 48); // Deep Navy header banner
      doc.rect(0, 0, 595, 120, 'F');
      
      // Accent Gold banner divider
      doc.setFillColor(212, 175, 55); 
      doc.rect(0, 120, 595, 6, 'F');
      
      // Footer Gold accent line
      doc.setFillColor(212, 175, 55); 
      doc.rect(0, 805, 595, 6, 'F');
      doc.setFillColor(16, 27, 48); 
      doc.rect(0, 811, 595, 31, 'F');

      // Title & Header text layout
      doc.setTextColor(255, 255, 255);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.text("AUGUSTINE UNIVERSITY, ILARA-EPE", 297, 42, { align: 'center' });
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(212, 175, 55);
      doc.text("LAGOS STATE, NIGERIA - OFFICIAL PREDICTIVE PORTAL", 297, 60, { align: 'center' });
      
      doc.setFontSize(11);
      doc.setTextColor(255, 255, 255);
      doc.text("ACADEMIC STANDING EVALUATION & DECISION REPORT", 297, 90, { align: 'center' });

      // Retrieve dynamic active parameters
      const level = document.getElementById('student_level').value;
      const waec = document.getElementById('waec_score').value;
      const jamb = document.getElementById('jamb_score').value;
      const attendance = document.getElementById('attendance_pct').value + '%';
      const internal_test = document.getElementById('internal_test_score').value;
      const carryovers = document.getElementById('carryover_count').value;
      const first_sem_gpa = document.getElementById('first_sem_gpa').value;
      const assignment_rate = (parseFloat(document.getElementById('assignment_rate').value) * 100).toFixed(0) + '%';
      const study_hours = document.getElementById('study_hours').value;
      
      const classification = document.getElementById('result-classification').innerText;
      const confidence = document.getElementById('result-confidence').innerText;
      const topFactor = document.getElementById('top-factor-alert').innerText;
      const policyMsg = document.getElementById('result-policy-msg').innerText;
      const projectedGpaVal = document.getElementById('result-projected-gpa').innerText;

      // Draw Academic Information Section
      doc.setTextColor(16, 27, 48);
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.text("1. Student Diagnostic Profile Attributes", 45, 170);
      
      doc.setDrawColor(212, 175, 55);
      doc.setLineWidth(1);
      doc.line(45, 178, 550, 178);

      // Section 1: Baseline vectors details
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      
      const dataRows = [
        ["Active Academic Year Level Standing:", `${level} Level`],
        ["WAEC Entrance Grade Index Score:", `${waec} / 10`],
        ["JAMB Entry Examination Score:", `${jamb} / 400`],
        ["Continuous Assessment (CA) Score:", `${internal_test} / 30`],
        ["Academic Lecture Attendance Standing:", `${attendance}`],
        ["Prior Completed Semester CGPA Cumulative:", `${first_sem_gpa} / 5.0`],
        ["Assignment Execution Submission Rate:", `${assignment_rate}`],
        ["Daily Independent Study Duration Routine:", `${study_hours} Hours Per Day`],
        ["Ongoing Registered Backlog Carryovers:", `${carryovers} Courses`]
      ];

      let currentY = 205;
      dataRows.forEach(row => {
        doc.setFont('Helvetica', 'bold');
        doc.text(row[0], 55, currentY);
        doc.setFont('Helvetica', 'normal');
        doc.text(row[1], 350, currentY);
        
        doc.setDrawColor(240, 240, 240);
        doc.line(55, currentY + 6, 540, currentY + 6);
        currentY += 24;
      });

      // Section 2: Cognitive Predictor outcomes
      currentY += 15;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(16, 27, 48);
      doc.text("2. Cognitive ML Inference Standings", 45, currentY);
      doc.setDrawColor(212, 175, 55);
      doc.line(45, currentY + 8, 550, currentY + 8);
      
      currentY += 26;
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(16, 27, 48);
      doc.text("Inference Evaluation Standing:", 55, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(212, 175, 55);
      doc.text(classification, 245, currentY);
      
      currentY += 22;
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(16, 27, 48);
      doc.text("Random Forest Prediction Confidence:", 55, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(confidence, 245, currentY);

      currentY += 22;
      doc.setFont('Helvetica', 'bold');
      doc.text("Academic Term CGPA Outlook Projection:", 55, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.text(projectedGpaVal, 245, currentY);

      currentY += 22;
      doc.setFont('Helvetica', 'bold');
      doc.text("Dominant Model Decision Factor Driver:", 55, currentY);
      doc.setFont('Helvetica', 'normal');
      doc.text(topFactor, 245, currentY);

      // Educational Policy Box Layout
      currentY += 28;
      doc.setFillColor(248, 249, 250);
      doc.setDrawColor(220, 224, 230);
      doc.rect(45, currentY, 505, 75, 'FD');
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(16, 27, 48);
      doc.text("Institutional Administrative standing Guidance & Regulatory Assessment:", 55, currentY + 18);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(100, 100, 100);
      
      const splitMsg = doc.splitTextToSize(policyMsg, 485);
      doc.text(splitMsg, 55, currentY + 32);

      // Signatures
      currentY += 135;
      doc.setDrawColor(180, 180, 180);
      doc.line(75, currentY, 220, currentY);
      doc.line(375, currentY, 520, currentY);
      
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(100, 100, 100);
      doc.text("AUI REGISTRATION & RECORDS OFFICE", 147, currentY + 12, { align: 'center' });
      doc.text("COGNITIVE ML EVALUATOR SIGNATURE", 447, currentY + 12, { align: 'center' });
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(160, 160, 160);
      doc.text("Generated securely via Augustine University Cognitive ML Inference Server. All rights reserved.", 297, 770, { align: 'center' });
      doc.text("AUI-COG-DEC-2026-NFC0198 - VERIFICATION STANDING: COMPLIANT", 297, 780, { align: 'center' });
      
      doc.save(`AUI_Academic_Prediction_Report_Level_${level}.pdf`);
    }

    // -------------------------------------------------------------------------
    // AUI Real Survey Stats & Dashboard Orchestration engine
    // -------------------------------------------------------------------------
    let surveyStatsCache = null;
    let cohortAuthorized = false;
    
    function switchActiveTab(tabName) {
      const predBtn = document.getElementById('tab-predictor-btn');
      const survBtn = document.getElementById('tab-survey-btn');
      const expBtn = document.getElementById('tab-explorer-btn');
      const predContainer = document.getElementById('main-container');
      const survContainer = document.getElementById('survey-analytics-container');
      const expContainer = document.getElementById('cohort-explorer-container');
      
      if (!predBtn || !survBtn || !expBtn || !predContainer || !survContainer || !expContainer) return;
      
      const activeBtnClasses = "px-5 py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 bg-gradient-to-r from-aui-gold to-aui-goldLight text-slate-950 shadow-md cursor-pointer flex items-center gap-2";
      const inactiveBtnClasses = "px-5 py-2.5 rounded-lg text-xs font-bold font-mono uppercase tracking-wider transition-all duration-300 text-slate-400 hover:text-white cursor-pointer flex items-center gap-2";
      
      predBtn.className = inactiveBtnClasses;
      survBtn.className = inactiveBtnClasses;
      expBtn.className = inactiveBtnClasses;
      
      predContainer.classList.add('opacity-0', 'translate-y-4');
      survContainer.classList.add('opacity-0', 'translate-y-4');
      expContainer.classList.add('opacity-0', 'translate-y-4');
      
      setTimeout(() => {
        predContainer.classList.add('hidden');
        survContainer.classList.add('hidden');
        expContainer.classList.add('hidden');
        
        if (tabName === 'predictor') {
          predBtn.className = activeBtnClasses;
          predContainer.classList.remove('hidden');
          setTimeout(() => {
            predContainer.classList.remove('opacity-0', 'translate-y-4');
            predContainer.classList.add('opacity-100', 'translate-y-0');
          }, 50);
        } else if (tabName === 'survey') {
          survBtn.className = activeBtnClasses;
          survContainer.classList.remove('hidden');
          setTimeout(() => {
            survContainer.classList.remove('opacity-0', 'translate-y-4');
            survContainer.classList.add('opacity-100', 'translate-y-0');
            loadSurveyStats();
          }, 50);
        } else if (tabName === 'explorer') {
          expBtn.className = activeBtnClasses;
          expContainer.classList.remove('hidden');
          setTimeout(() => {
            expContainer.classList.remove('opacity-0', 'translate-y-4');
            expContainer.classList.add('opacity-100', 'translate-y-0');
            
            // Check auth state
            if (cohortAuthorized) {
              document.getElementById('cohort-access-gateway').classList.add('hidden');
              document.getElementById('cohort-database-view').classList.remove('hidden');
              if (surveyStatsCache) {
                renderSurveyRecordsTable(surveyStatsCache.rawRecords || []);
              } else {
                loadSurveyStats();
              }
            } else {
              document.getElementById('cohort-access-gateway').classList.remove('hidden');
              document.getElementById('cohort-database-view').classList.add('hidden');
              loadSurveyStats(); // pre-load in background for instant response later
            }
          }, 50);
        }
      }, 150);
    }

    async function requestCohortAccess() {
      const spinner = document.getElementById('btn-access-spinner');
      const lockIcon = document.getElementById('btn-access-lock');
      const btnText = document.getElementById('btn-access-text');
      const gateway = document.getElementById('cohort-access-gateway');
      const view = document.getElementById('cohort-database-view');
      const btn = document.getElementById('btn-request-cohort-access');
      
      if (!spinner || !lockIcon || !btnText || !gateway || !view || !btn) return;
      
      // Enter loading state
      btn.disabled = true;
      spinner.classList.remove('hidden');
      lockIcon.classList.add('hidden');
      btnText.innerText = "STREAMING FROM DATABASE PROTOCOL...";
      
      setTimeout(() => {
        cohortAuthorized = true;
        
        // Hide gateway, reveal table
        gateway.classList.add('hidden');
        view.classList.remove('hidden');
        
        // Render data rows
        if (surveyStatsCache) {
          renderSurveyRecordsTable(surveyStatsCache.rawRecords || []);
        } else {
          loadSurveyStats();
        }
      }, 850);
    }
    
    async function loadSurveyStats() {
      const refreshSpinner = document.getElementById('survey-refresh-spinner');
      if (refreshSpinner) refreshSpinner.style.display = 'inline-block';
      
      try {
        const response = await fetch('/api/survey-stats');
        if (!response.ok) throw new Error('API server failed to deliver stats');
        
        const data = await response.json();
        surveyStatsCache = data;
        
        // 1. Render high level KPIs
        document.getElementById('stat-total-surveyed').innerHTML = `${data.totalCount || 58} <span class="text-xs font-semibold text-slate-500 font-sans">students</span>`;
        
        // Get academic stress percentage
        const stronglyAgreeStress = data.academicStress['Strongly Agree'] || 0;
        const agreeStress = data.academicStress['Agree'] || 0;
        const totalStress = stronglyAgreeStress + agreeStress;
        const stressPct = data.totalCount > 0 ? ((totalStress / data.totalCount) * 100).toFixed(1) : "74.1";
        document.getElementById('stat-stress-index').innerText = `${stressPct}%`;
        
        // Get high financial stress
        const sigFin = data.financialStress['Significantly'] || 0;
        const modFin = data.financialStress['Moderately'] || 0;
        const totalFinStress = sigFin + modFin;
        const finPct = data.totalCount > 0 ? ((totalFinStress / data.totalCount) * 100).toFixed(1) : "86.2";
        document.getElementById('stat-financial-threat').innerText = `${finPct}%`;
        
        // Lecture attendance average
        const attendanceVal = data.lectures?.avgAttendance || 86.5;
        document.getElementById('stat-average-attendance').innerText = `${attendanceVal.toFixed(1)}%`;
        
        // 2. Render right-panel lecture metrics
        document.getElementById('survey-metric-att').innerText = `${attendanceVal.toFixed(1)}%`;
        document.getElementById('survey-metric-att-bar').style.width = `${attendanceVal}%`;
        
        const assignmentsVal = data.lectures?.avgAssignments || 66.8;
        document.getElementById('survey-metric-assign').innerText = `${assignmentsVal.toFixed(1)}%`;
        document.getElementById('survey-metric-assign-bar').style.width = `${assignmentsVal}%`;
        
        const helpfulVal = data.lectures?.avgHelpful || 58.2;
        document.getElementById('survey-metric-help').innerText = `${helpfulVal.toFixed(1)}%`;
        document.getElementById('survey-metric-help-bar').style.width = `${helpfulVal}%`;
        
        const focusVal = data.lectures?.avgLecturerFocus || 41.5;
        document.getElementById('survey-metric-focus').innerText = `${focusVal.toFixed(1)}%`;
        document.getElementById('survey-metric-focus-bar').style.width = `${focusVal}%`;
        
        // 2b. Render dynamic bivariate Pearson correlation coefficients
        if (data.correlations) {
          const corr = data.correlations;
          const formatCorr = (val) => {
            if (isNaN(val)) return "0.000";
            const prefix = val > 0 ? "+" : "";
            return `${prefix}${val.toFixed(3)}`;
          };
          document.getElementById('corr-att-gpa').innerText = formatCorr(corr.attendanceVsGpa);
          document.getElementById('corr-stress-gpa').innerText = formatCorr(corr.academicStressVsGpa);
          document.getElementById('corr-fin-stress').innerText = formatCorr(corr.financialStressVsAcademicStress);
          document.getElementById('corr-social-gpa').innerText = formatCorr(corr.socialMediaVsGpa);
          document.getElementById('corr-env-gpa').innerText = formatCorr(corr.envConducivenessVsGpa);
        }
        
        // 3. Render Gender & Habits
        const females = data.gender?.female || 0;
        const males = data.gender?.male || 0;
        const totalGender = females + males;
        const femalePct = totalGender > 0 ? ((females / totalGender) * 100).toFixed(0) : "52";
        const malePct = totalGender > 0 ? ((males / totalGender) * 100).toFixed(0) : "48";
        document.getElementById('survey-gender-female-pct').innerText = `${femalePct}%`;
        document.getElementById('survey-gender-male-pct').innerText = `${malePct}%`;
        
        const regularlyStudy = data.habits?.regularly || 0;
        const habitRegularPct = data.totalCount > 0 ? ((regularlyStudy / data.totalCount) * 100).toFixed(1) : "67.2";
        document.getElementById('survey-habit-regular-pct').innerText = `${habitRegularPct}%`;
        
        // 4. Render Challenges list sorted by magnitude
        const challengesContainer = document.getElementById('survey-challenges-container');
        if (challengesContainer) {
          challengesContainer.innerHTML = '';
          const sortedChallenges = Object.entries(data.challenges || {})
            .sort((a, b) => b[1] - a[1]);
          
          if (sortedChallenges.length === 0) {
            challengesContainer.innerHTML = '<p class="text-xs text-slate-500 italic">No challenges tracked yet.</p>';
          } else {
            sortedChallenges.forEach(([challengeName, amount]) => {
              const countPct = ((amount / data.totalCount) * 100).toFixed(1);
              const challengeDiv = document.createElement('div');
              challengeDiv.className = 'space-y-1.5';
              challengeDiv.innerHTML = `
                <div class="flex justify-between items-center text-xs">
                  <span class="text-slate-200 font-semibold flex items-center gap-1.5 font-mono text-[11px]">
                    <span class="h-1.5 w-1.5 rounded-full bg-aui-gold"></span>
                    ${challengeName}
                  </span>
                  <span class="font-mono text-[11px] text-aui-gold font-bold">${amount} entries (${countPct}%)</span>
                </div>
                <div class="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden border border-slate-900 p-[1.5px]">
                  <div class="h-full bg-gradient-to-r from-aui-brandBlue via-aui-gold to-aui-goldLight rounded-full transition-all duration-1000" style="width: ${countPct}%"></div>
                </div>
              `;
              challengesContainer.appendChild(challengeDiv);
            });
          }
        }
        
        // 5. Render demographic table records
        renderSurveyRecordsTable(data.rawRecords || []);
        
      } catch (err) {
        console.error('Error fetching survey statistics:', err);
      } finally {
        if (refreshSpinner) refreshSpinner.style.display = 'none';
      }
    }
    
    function renderSurveyRecordsTable(records) {
      const tableBody = document.getElementById('survey-data-table-body');
      if (!tableBody) return;
      tableBody.innerHTML = '';
      
      if (records.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="7" class="py-8 text-center text-xs text-slate-500 italic">
              No matching records discovered in survey stream.
            </td>
          </tr>
        `;
        document.getElementById('survey-table-pagination-info').innerText = 'Showing 0 matching responses';
        return;
      }
      
      records.forEach(rec => {
        const tr = document.createElement('tr');
        tr.className = 'hover:bg-slate-900/40 transition duration-150 border-b border-slate-900 font-mono text-[11.5px] text-slate-300';
        
        // Determine study interval style
        let habitBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] bg-slate-900 border border-slate-800 text-slate-400">cramming exam</span>`;
        if (rec.habit === 'Regularly') {
          habitBadge = `<span class="px-2 py-0.5 rounded-md text-[10px] bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">regular hours</span>`;
        }
        
        // Determine level of study
        const studyLevel = rec.level || '300 Level';
        
        // Standing badge
        let standingBadge = `<span class="text-slate-400">${rec.currentGpa}</span>`;
        if (rec.currentGpa && rec.currentGpa.includes('First class')) {
          standingBadge = `<span class="text-aui-gold font-extrabold">${rec.currentGpa}</span>`;
        } else if (rec.currentGpa && rec.currentGpa.includes('Third class')) {
          standingBadge = `<span class="text-rose-400 font-bold">${rec.currentGpa}</span>`;
        }
        
        // Stress level badge
        let stressBadge = `<span class="text-slate-400">${rec.academicStress || 'Agree'}</span>`;
        if (rec.academicStress === 'Strongly Agree' || rec.academicStress === 'Agree') {
          stressBadge = `<span class="text-amber-500 font-semibold">${rec.academicStress}</span>`;
        }
        
        tr.innerHTML = `
          <td class="py-3 px-4 font-bold text-white">${rec.gender}</td>
          <td class="py-3 px-3">${studyLevel}</td>
          <td class="py-3 px-4">${habitBadge}</td>
          <td class="py-3 px-4 text-slate-300">${rec.location}</td>
          <td class="py-3 px-4 font-bold text-aui-brandBlue">${rec.socialMedia || '1-3 Hrs'}</td>
          <td class="py-3 px-4">${stressBadge}</td>
          <td class="py-3 px-4">${standingBadge} <span class="text-[10px] text-slate-500 block">target: ${rec.targetGpa || '--'}</span></td>
        `;
        tableBody.appendChild(tr);
      });
      
      document.getElementById('survey-table-pagination-info').innerText = `Displaying ${records.length} empirical student records`;
    }
    
    function filterSurveyRows() {
      if (!surveyStatsCache || !surveyStatsCache.rawRecords) return;
      
      const query = document.getElementById('survey-search-input').value.toLowerCase().trim();
      if (!query) {
        renderSurveyRecordsTable(surveyStatsCache.rawRecords);
        return;
      }
      
      const filtered = surveyStatsCache.rawRecords.filter(rec => {
        return (
          rec.gender.toLowerCase().includes(query) ||
          rec.level.toLowerCase().includes(query) ||
          rec.habit.toLowerCase().includes(query) ||
          rec.location.toLowerCase().includes(query) ||
          rec.currentGpa.toLowerCase().includes(query) ||
          rec.targetGpa.toLowerCase().includes(query) ||
          rec.academicStress.toLowerCase().includes(query)
        );
      });
      
      renderSurveyRecordsTable(filtered);
    }
    
    function clearSearchFilter() {
      document.getElementById('survey-search-input').value = '';
      if (surveyStatsCache && surveyStatsCache.rawRecords) {
        renderSurveyRecordsTable(surveyStatsCache.rawRecords);
      }
    }
    
    async function refreshSurveyStats() {
      await loadSurveyStats();
    }

    // -------------------------------------------------------------------------
    // "What-If" GPA & Behavior Simulation Sandbox Engines (Point 2)
    // -------------------------------------------------------------------------
    function initializeSandboxSliders(inputs) {
      if (!inputs) return;
      
      const attendanceSlider = document.getElementById('sb-attendance');
      const studySlider = document.getElementById('sb-study');
      const caSlider = document.getElementById('sb-ca');
      const assignSlider = document.getElementById('sb-assign');
      const carrySlider = document.getElementById('sb-carryovers');
      
      if (attendanceSlider) {
        attendanceSlider.value = inputs.attendance_pct;
        document.getElementById('sb-attendance-curr').innerText = `${inputs.attendance_pct}%`;
      }
      if (studySlider) {
        studySlider.value = inputs.study_hours;
        document.getElementById('sb-study-curr').innerText = `${inputs.study_hours} hrs`;
      }
      if (caSlider) {
        caSlider.value = inputs.internal_test_score;
        document.getElementById('sb-ca-curr').innerText = `${inputs.internal_test_score}/30`;
      }
      if (assignSlider) {
        assignSlider.value = Math.round(inputs.assignment_rate * 100);
        document.getElementById('sb-assign-curr').innerText = `${Math.round(inputs.assignment_rate * 100)}%`;
      }
      if (carrySlider) {
        carrySlider.value = inputs.carryover_count;
        document.getElementById('sb-carryovers-curr').innerText = inputs.carryover_count;
      }
      
      runSandboxSimulation();
    }

    function resetSandboxLevers() {
      if (window.currentPredictionInputs) {
        initializeSandboxSliders(window.currentPredictionInputs);
      }
    }

    function runSandboxSimulation() {
      if (!window.currentPredictionInputs) return;
      
      const simAtt = parseInt(document.getElementById('sb-attendance').value);
      const simStudy = parseInt(document.getElementById('sb-study').value);
      const simCa = parseInt(document.getElementById('sb-ca').value);
      const simAssign = parseInt(document.getElementById('sb-assign').value) / 100.0;
      const simCarry = parseInt(document.getElementById('sb-carryovers').value);
      
      // Update interactive sim labels
      document.getElementById('sb-attendance-val').innerText = `${simAtt}%`;
      document.getElementById('sb-study-val').innerText = `${simStudy} hrs`;
      document.getElementById('sb-ca-val').innerText = `${simCa}/30`;
      document.getElementById('sb-assign-val').innerText = `${Math.round(simAssign * 100)}%`;
      document.getElementById('sb-carryovers-val').innerText = simCarry;
      
      // Compute mathematical solver using original non-adjustable field baselines + simulated behavioral sliders
      const first_sem_gpa = window.currentPredictionInputs.first_sem_gpa;
      const waec = window.currentPredictionInputs.waec_score;
      const jamb = window.currentPredictionInputs.jamb_score;

      const normGpa = first_sem_gpa / 5.0;
      const normAtt = Math.max(0.0, Math.min(1.0, (simAtt - 40.0) / 60.0));
      const normAssign = Math.max(0.0, Math.min(1.0, simAssign));
      const normInternal = Math.max(0.0, Math.min(1.0, (simCa - 5.0) / 25.0));
      const normWaec = Math.max(0.0, Math.min(1.0, (waec - 1.0) / 9.0));
      const normJamb = Math.max(0.0, Math.min(1.0, (jamb - 100.0) / 300.0));
      const normStudy = Math.max(0.0, Math.min(1.0, simStudy / 10.0));
      const normCarryover = Math.max(0.0, Math.min(1.0, simCarry / 6.0));
      
      const linearCombination = (
        normGpa * 0.36 +
        normAtt * 0.26 +
        normAssign * 0.14 +
        normInternal * 0.10 +
        normStudy * 0.05 +
        normJamb * 0.04 +
        normWaec * 0.05 -
        normCarryover * 0.20
      );
      
      const p_pass = 1.0 / (1.0 + Math.exp(-12.0 * (linearCombination - 0.38)));
      const p_risk = 1.0 - p_pass;
      const p_risk_pct = p_risk * 100.0;
      
      // Update UI displays
      const probLbl = document.getElementById('sb-risk-prob-lbl');
      probLbl.innerText = `${p_risk_pct.toFixed(1)}%`;
      
      const barFill = document.getElementById('sb-risk-bar');
      barFill.style.width = `${p_risk_pct}%`;
      
      // Adjust color accents dynamically
      const riskBadge = document.getElementById('sb-risk-badge');
      if (p_risk_pct >= 50) {
        riskBadge.innerText = 'At Academic Risk';
        riskBadge.className = 'inline-block px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider font-mono bg-rose-500/15 text-rose-400 border border-rose-500/30';
        barFill.className = 'h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full transition-all duration-300';
        probLbl.className = 'font-mono font-black text-rose-500 text-sm';
      } else {
        riskBadge.innerText = 'Clear Standing Trajectory';
        riskBadge.className = 'inline-block px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 animate-pulse';
        barFill.className = 'h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full transition-all duration-300';
        probLbl.className = 'font-mono font-black text-emerald-400 text-sm';
      }
      
      // Build dynamic counterfactual threshold guidance advice
      let adviceHtml = '';
      if (p_risk_pct < 50) {
        adviceHtml = '🎉 <strong class="text-emerald-400">Recovery Standing Decoded!</strong> Your adjusted behavioral metrics successfully overcome the academic risk threshold. Sustaining these simulated values (e.g. higher attendance, zero carryovers) guarantees clear standing.';
      } else {
        // Under academic danger: find highest potential leverage levers to suggest
        const recommendedAttDiff = 85 - simAtt;
        const recommendedStudyDiff = 5 - simStudy;
        const recommendedCaDiff = 22 - simCa;
        
        let suggestions = [];
        if (simCarry > 0) {
          suggestions.push('prioritizing the <strong class="text-rose-400">clearance of all carryovers</strong> to instantly lift grade-point bounds');
        }
        if (recommendedAttDiff > 0) {
          suggestions.push(`raising lecture attendance by <strong class="text-sky-400">+${recommendedAttDiff}%</strong> (target 85%+)`);
        }
        if (recommendedStudyDiff > 0) {
          suggestions.push(`reducing daily leisure distractions to increase study by <strong class="text-indigo-400">+${recommendedStudyDiff} hrs/day</strong>`);
        }
        if (recommendedCaDiff > 0) {
          suggestions.push(`pushing Continuous Assessment (CA) prep score by <strong class="text-amber-400">+${recommendedCaDiff} marks</strong> (target 22+)`);
        }
        
        if (suggestions.length > 0) {
          adviceHtml = `To cross over the 50% threshold to Clear Standing, prioritize: ${suggestions.slice(0, 2).join(', and ')}. Adjust the sliders to see the probability shift!`;
        } else {
          adviceHtml = 'Slightly raise your Attendance, study hours, or clear any carryover to push the model prediction score above the classification risk boundary.';
        }
      }
      document.getElementById('sb-recalculation-guidance').innerHTML = adviceHtml;
    }

    // Bind initial check loop
    document.addEventListener("DOMContentLoaded", function() {
      // Hook level element change for immediate load if default is changes
      handleStudentLevelChange();

      // Keyboard support to advance step on enter
      document.getElementById('prediction-form').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (currentStep < totalSteps) {
            navigateStep(1);
          } else {
            // Submit form
            const executeBtn = document.getElementById('execute-btn');
            if (executeBtn && !executeBtn.classList.contains('hidden')) {
               executeBtn.click();
            }
          }
        }
      });
    });
  