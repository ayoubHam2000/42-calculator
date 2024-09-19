function addProjects(projectData)
{
  let projectsOption = document.getElementById("project")


  projectsOption.innerHTML = '<option disabled selected>Choose one...</option>'
  for (project of projectData)
  {
    projectsOption.innerHTML += `<option> ${project.name} </option>`
  }
  
}

async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();

    return data

  } catch (error) {
    console.error('There was a problem with the fetch operation:', error);
  }
}

async function loadData()
{
  let currentLevel = document.getElementsByName("level")[0].value;



  let xpData = await fetchData('assets/xp.json');
  let projectsData = await fetchData('assets/project_data.json');
  

  projectsData.sort((a, b) => a.name.localeCompare(b.name))
  addProjects(projectsData)

  for (let i = 0; i < xpData.length - 1; i++)
  {
    let levelXP = xpData[i].xp
    nextLevelXP = xpData[i + 1].xp
    xpData[i].xpToNextLevel = nextLevelXP - levelXP
  }

  libft = {
    x : 2999.,
    y : 2999.
  }


  let subjects = projectsData.map((project) => {
    return {
      ID   : project.id,
      name : project.name,
      Slug : project.slug,
      XP       : project.difficulty,
      Position : Math.floor(Math.hypot(project.x - libft.x, project.y - libft.y)),
    }
  })






  const series = [currentLevel, currentLevel];
  const labels = ["Current level", "New level"];
  const xpForSeries = [];
  const bhDays = [];
  let initialUserXP;
  let charts;
  let newLevel;
  
  function deleteProject(number)
  {
    console.log(number)
    console.log("series", series)
    console.log("labels", labels)
    console.log("xpForSeries", xpForSeries)
    console.log("bhDays", bhDays)
    console.log("initialUserXP", initialUserXP)
    console.log("newLevel", newLevel)
  }

  window.deleteFun = deleteProject


  

  let graphData = []

  function updateUserXP(id){
    const graphItem = graphData[id]

    const level = graphItem.levelSelect.value;
    let levelData = xpData.find(({ lvl }) => lvl == parseInt(level));
    if (!levelData)
      levelData = xpData[xpData.length-1];
    graphItem.userXP = levelData.xp + levelData.xpToNextLevel * (level - parseInt(level));
    if (id == 0) {
      initialUserXP = graphItem.userXP;
      xpForSeries[0] = graphItem.userXP;
    }
  }

  function updateLevel(id){
    const graphItem = graphData[id]

    const newXP = graphItem.userXP + parseInt(graphItem.xpSelect.value||0)*((graphItem.mark.value||100)/100);
    if (graphItem.levelSelect.value < 0 || graphItem.mark.value < 0) return;
    xpForSeries[id+1] = newXP;

    let levelForXP;
    let i;
    for (i in xpData) {
      i = parseInt(i);
      if (xpData[i].xp > newXP) {
        levelForXP = xpData[i-1];
        break;
      }
    }

    // let levelForInitialXP;
    // for (let j in xpData) {
    //   j = parseInt(j);
    //   if (xpData[j].xp > initialUserXP) {
    //     levelForInitialXP = xpData[j-1];
    //     break;
    //   }
    // }

    const xpToNextLevel = Math.max(0, parseInt(xpData[i].xp-newXP));
    document.querySelector(".xp-required").
      textContent = `${xpToNextLevel} XP until next level`;

    if (!levelForXP)
      newLevel = 30;
    else
      newLevel = levelForXP.lvl +
        (newXP - levelForXP.xp)/levelForXP.xpToNextLevel;
    series[id + 1] = newLevel.toFixed(2);
    labels[id + 1] = graphItem.reason;
    // charts.updateSeries([{
    //   name: "Level",
    //   data: series,
    // }]);
    // charts.updateOptions({ labels, });

    const levelsEarned = series[series.length-1] - document.getElementsByName("level")[0].value;
    let sign = "+";
    if (levelsEarned < 0)
      sign = "";
    document.querySelector(".plus-level").
      textContent = sign + levelsEarned.toFixed(2);

    function calcBlackhole(oldXP, newXP) {
      const blackholeEarned = parseInt((((
        Math.min(newXP, 78880)/49980)**0.45)
          -((oldXP/49980)**0.45))*483);
      if (oldXP <= newXP && blackholeEarned < 0) {
        return "+ 0 days";
      }

      sign = "+";
      if (blackholeEarned < 0)
        sign = "";
      return sign + blackholeEarned + (blackholeEarned == 1 ? " day" : " days");
    }
    if (xpForSeries[id] != undefined)
      bhDays[id+1] = calcBlackhole(xpForSeries[id], newXP);
    document.querySelector(".plus-days").
      textContent = calcBlackhole(initialUserXP,
        xpForSeries[xpForSeries.length-1]);
  }

  function updateAll(id, level, xp, mark)
  {
    for (let i = id; i < graphData.length; i++)
    {
      const item = graphData[i]
      const _level = item.levelSelect
      const _mark = item.mark
      const _xpSelect = item.xpSelect

      if (level != null)
      {
        if (i != id)
          _level.value = `${level}`
        series[i] = level
      }
      if (xp != null)
        _xpSelect.value = xp
      if (mark != null)
        _mark.value = mark

      updateUserXP(i)
      updateLevel(i)

      level = series[i + 1];
      xp = null
      mark = null
    }
    charts.updateSeries([{
      name: "Level",
      data: series,
    }]);
    charts.updateOptions({ labels, });
  }

  function addEvents(id)
  {

    const graphItem = graphData[id]

    graphItem.levelSelect.addEventListener("input", () => {
      updateAll(id, graphItem.levelSelect.value, null, null)
    });

    graphItem.xpSelect.addEventListener("input", () => {
      graphItem.subjectSelect.selectedIndex = 0;
      graphItem.reason = `+ ${graphItem.xpSelect.value} XP`;

      updateAll(id, null, null, "100")

    });

    graphItem.subjectSelect.addEventListener("change", () => {
      for (const subject of subjects) {
        if (subject.name.trim() == graphItem.subjectSelect.selectedOptions[0].value.trim()) {
          graphItem.reason = subject.name;
          updateAll(id, null, subject.XP, null)
          break;
        }
      }
    });

    graphItem.mark.addEventListener("input", () => {
      updateAll(id, null, null, null)
    });
  }

  function addProject(number)
  {
    graphData.push({
      userXP : 0,
      reason : "New level",
      levelSelect : document.getElementsByName("level")[number],
      subjectSelect : document.getElementsByName("project")[number],
      xpSelect : document.getElementsByName("xp")[number],
      mark : document.getElementsByName("mark")[number],
    })

    
    updateUserXP(number);
    updateLevel(number);
    addEvents(number);

  }



  charts = new ApexCharts(document.querySelector("#graph"), {
    series: [{
      name: "Level",
      data: series,
    }],
    chart: {
      type: "area",
      height: 400,
      width: 1000,
      toolbar: {
        show: false,
      },
    },
    yaxis: {
      labels: {
        formatter: (value, index) => {
          const level = value.toFixed(2);
          if (!index ||
            index.dataPointIndex == 0 ||
            !bhDays[index.dataPointIndex])
            return level;
          return `${level} (${bhDays[index.dataPointIndex]})`;
        },
      },
    },
    tooltip: {
      theme: "dark",
    },
    stroke: {
      curve: "straight",
    },
    labels,
  });
  charts.render();
  
  let nth = 1;
  const addAnotherLevel = () => {
    const projects = document.querySelector("#projects");
    const projectPickers = document.querySelectorAll(".project-picker");
    const newProjectPicker = projectPickers[projectPickers.length-1].cloneNode(true); // deep
    if (newLevel)
      newProjectPicker.querySelector("*[name=\"level\"]").value = newLevel.toFixed(2);
    newProjectPicker.querySelector("*[name=\"xp\"]").value = "";
    // document.querySelector("#add-project").remove();
    // const divider = document.createElement("div");
    // divider.classList.add("divider", "!mt-6", "!mb-5");
    // projects.appendChild(divider);
    projects.appendChild(newProjectPicker);
    // newProjectPicker.querySelector("#add-project")
    //   .addEventListener("click", addAnotherLevel);
    addProject(nth++);
  }
  const popProject = () => {
    if (graphData.length >= 2)
    {
      const projects = document.querySelector("#projects");
      if (projects.lastElementChild) {
        projects.removeChild(projects.lastElementChild);
      }

      graphData.pop()
      nth--;
      index = graphData.length - 1
      // series.splice(index - 1, 1);
      // labels.splice(index - 1, 1);
      // xpForSeries.splice(index - 1, 1);
      // bhDays.splice(index - 1, 1);
      
      series.pop()
      labels.pop()
      xpForSeries.pop()
      bhDays.pop()
      updateAll(index, null, null, null)
    }
  }
  document.querySelector("#add-project").
    addEventListener("click", addAnotherLevel);
  document.querySelector("#delete-project").
    addEventListener("click", popProject);
  addProject(0);
  

}

loadData()

