document.addEventListener("DOMContentLoaded", function() {
    const searchButton = document.getElementById("search-btn");
    const usernameInput = document.getElementById("user-input");
    const statsContainer = document.querySelector(".stats-container");
    const easyProgressCircle = document.querySelector(".easy-progress");
    const mediumProgressCircle = document.querySelector(".medium-progress");
    const hardProgressCircle = document.querySelector(".hard-progress");
    const easyLevel = document.querySelector(".easy-level");
    const mediumLevel = document.querySelector(".medium-level");
    const hardLevel = document.querySelector(".hard-level");
    const statsCard = document.querySelector(".stats-card");


    function validateUsername(username){
        if(username.trim() === ""){
            alert("username should not be empty");
            return false;
        }
        const regex = /^[a-zA-Z0-9_]{3,16}$/;
        const isMatching = regex.test(username);
        if(!isMatching)
            alert("Invalid username");
        return isMatching;
    }

    function updateProgress(solved, total, label, circle) {
        const percentage = total > 0 ? (solved / total) * 100 : 0;
        // The CSS custom property for conic-gradient is expecting a percentage
        circle.style.setProperty("--progress-degree", `${percentage}%`);
        label.textContent = `${solved}/${total}`;
    }


    async function fetchUserDetails(username) {
        const url = `https://leetcode-api-faisalshohag.vercel.app/${username}`;
        try{
            searchButton.textContent = "Searching...";
            searchButton.disabled = true;
            statsContainer.classList.add("hidden");

            const controller = new AbortController();
            setTimeout(() => controller.abort(), 5000);

            const response = await fetch(url, { signal: controller.signal });
            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Error: ${response.status} - ${text}`);
            }
            const data = await response.json();
            console.log("Logging data:" , data);

            displayUserData(data);

        }
        catch(error){
            console.log("Error:", error); // debug
            statsContainer.classList.remove("hidden"); // show container
            statsContainer.innerHTML = `<p>No data found</p>`;
        }
        finally{
            searchButton.textContent = "Search";
            searchButton.disabled = false;
        }
    }


    function displayUserData(data){
        statsContainer.classList.remove("hidden");
        // First, check for API-level errors (e.g., user not found)
        if (data.status === 'error') {
            statsContainer.innerHTML = `<p class="error-message">User not found or an error occurred.</p>`;
            return;
        }

        // Show the stats container
        statsContainer.style.display = 'block';
        statsContainer.innerHTML = `
            <div class="progress">
                <div class="progress-item">
                    <div class="easy-progress circle">
                        <span id="easy-level"></span>
                        Easy
                    </div>
                </div>

                <div class="progress-item">
                    <div class="medium-progress circle">
                        <span id="medium-level"></span>
                        Medium
                    </div>
                </div>

                <div class="progress-item">
                    <div class="hard-progress circle">
                        <span id="hard-level"></span>
                        Hard
                    </div>
                </div>

                <div class="stats-card">
                    
                </div>
            </div>
        `;

        // Update the newly created DOM elements
        const newEasyLevel = document.getElementById("easy-level");
        const newMediumLevel = document.getElementById("medium-level");
        const newHardLevel = document.getElementById("hard-level");
        const newEasyProgressCircle = document.querySelector(".easy-progress.circle");
        const newMediumProgressCircle = document.querySelector(".medium-progress.circle");
        const newHardProgressCircle = document.querySelector(".hard-progress.circle");
        const newCardStatsContainer = document.querySelector(".stats-card");

        //update progress bars
        updateProgress(data.easySolved, data.totalEasy, newEasyLevel, newEasyProgressCircle);
        updateProgress(data.mediumSolved, data.totalMedium, newMediumLevel, newMediumProgressCircle);
        updateProgress(data.hardSolved, data.totalHard, newHardLevel, newHardProgressCircle);

        const cardsData = [
            { label: "Total Solved", value: data.totalSolved },
            { label: "Ranking", value: data.ranking },
            { label: "Acceptance Rate", value: `${(data.acceptanceRate || 0).toFixed(2)}%` },
            { label: "Contribution Points", value: data.contributionPoints || "N/A" }
        ];

        // Populate the stats cards
        newCardStatsContainer.innerHTML = cardsData.map(card => `
            <div class="card">
                <h4>${card.label}</h4>
                <p>${card.value}</p>
            </div>
        `).join("");

    }

    searchButton.addEventListener("click", function() {
        const username = usernameInput.value;
        console.log("username : ", username);
        if(validateUsername(username)) {
            fetchUserDetails(username);
        }
    });

    usernameInput.addEventListener("input", function() {
        statsContainer.classList.add("hidden");
        statsContainer.innerHTML = "";
    });

    usernameInput.addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevents form submission if it were in a form
            searchButton.click();
        }
    });
})