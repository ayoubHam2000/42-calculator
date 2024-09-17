function addProject(number) {
  let userXP;
  let reason = "New level";
  const levelSelect = document.getElementsByName("level")[number];
  const subjectSelect = document.getElementsByName("project")[number];
  const xpSelect = document.getElementsByName("xp")[number];
  const mark = document.getElementsByName("mark")[number];


  const updateUserXP = () => {
    const level = levelSelect.value;
    let levelData = xpData.find(({ lvl }) => lvl == parseInt(level));
    if (!levelData)
      levelData = xpData[xpData.length-1];
    userXP = levelData.xp + levelData.xpToNextLevel * (level - parseInt(level));
    if (number == 0) {
      initialUserXP = userXP;
      xpForSeries[0] = userXP;
    }
  }
  updateUserXP();

  const updateLevel = () => {
    const newXP = userXP + parseInt(xpSelect.value||0)*((mark.value||100)/100);
    if (levelSelect.value < 0 || mark.value < 0) return;
    xpForSeries[number+1] = newXP;

    let levelForXP;
    let i;
    for (i in xpData) {
      i = parseInt(i);
      if (xpData[i].xp > newXP) {
        levelForXP = xpData[i-1];
        break;
      }
    }

    let levelForInitialXP;
    for (let j in xpData) {
      j = parseInt(j);
      if (xpData[j].xp > initialUserXP) {
        levelForInitialXP = xpData[j-1];
        break;
      }
    }

    const xpToNextLevel = Math.max(0, parseInt(xpData[i].xp-newXP));
    document.querySelector(".xp-required").
      textContent = `${xpToNextLevel} XP until next level`;

    if (!levelForXP)
      newLevel = 30;
    else
      newLevel = levelForXP.lvl +
        (newXP - levelForXP.xp)/levelForXP.xpToNextLevel;
    series[number+1] = newLevel.toFixed(2);
    labels[number+1] = reason;
    charts.updateSeries([{
      name: "Level",
      data: series,
    }]);
    charts.updateOptions({ labels, });

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
    if (xpForSeries[number] != undefined)
      bhDays[number+1] = calcBlackhole(xpForSeries[number], newXP);
    document.querySelector(".plus-days").
      textContent = calcBlackhole(initialUserXP,
        xpForSeries[xpForSeries.length-1]);
  }
  updateLevel();


  function updateAll(id, level, xp, mark)
  {
    const _mark = document.getElementsByName("mark")[id];
    const _xpSelect = document.getElementsByName("xp")[id];

    series[id] = level
    if (xp != None)
      _xpSelect.value = xp
    if (mark != None)
      _mark.value = mark

    updateLevel()
    updateUserXP()
    if (id < series.length - 2)
      updateAll(id + 1, newLevel, None, None)
  }


  levelSelect.addEventListener("input", () => {
    currentLevel = levelSelect.value;
    series[number] = currentLevel;
    updateUserXP();
    updateLevel();
  });
  xpSelect.addEventListener("input", () => {
    mark.value = "100";
    subjectSelect.selectedIndex = 0;
    reason = `+ ${xpSelect.value} XP`;
    updateLevel();
  });
  subjectSelect.addEventListener("change", () => {
    for (const subject of subjects) {
      if (subject.name.trim() == subjectSelect.selectedOptions[0].value.trim()) {
        xpSelect.value = subject.XP;
        reason = subject.name;
        updateLevel();
      }
    }
  });
  mark.addEventListener("input", () => {
    updateLevel(subjectSelect.selectedOptions[0].value);
  });
}