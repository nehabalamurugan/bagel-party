// Main canvas — wires the four direction sections together.
const { useState } = React;

function App() {
  return (
    <DesignCanvas
      title="Schmear &amp; Schmooze"
      subtitle="Blind cream cheese tasting · 4 visual directions for the same app"
    >
      <DCSection
        id="d1-deli"
        title="01 · Deli Counter"
        subtitle="Cream, rye, hand-drawn type. Numbers as butcher-counter tickets."
      >
        <DCArtboard id="d1-meta" label="Direction" width={300} height={640}>
          <Direction1Meta />
        </DCArtboard>
        <DCArtboard id="d1-s1" label="01 · Landing" width={340} height={660}>
          <DeliLanding />
        </DCArtboard>
        <DCArtboard id="d1-s2" label="02 · Flight reveal" width={340} height={660}>
          <DeliReveal />
        </DCArtboard>
        <DCArtboard id="d1-s3" label="03 · Voting" width={340} height={660}>
          <DeliVote />
        </DCArtboard>
        <DCArtboard id="d1-s4" label="04 · Leaderboard (TV)" width={780} height={480}>
          <DeliLeaderboard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="d2-tourney"
        title="02 · Tournament Brackets"
        subtitle="Dark mode, neon, scoreboard energy. Numbers as jersey numbers."
      >
        <DCArtboard id="d2-meta" label="Direction" width={300} height={640}>
          <Direction2Meta />
        </DCArtboard>
        <DCArtboard id="d2-s1" label="01 · Check in" width={340} height={660}>
          <TourneyLanding />
        </DCArtboard>
        <DCArtboard id="d2-s2" label="02 · Roster drop" width={340} height={660}>
          <TourneyReveal />
        </DCArtboard>
        <DCArtboard id="d2-s3" label="03 · Cast vote" width={340} height={660}>
          <TourneyVote />
        </DCArtboard>
        <DCArtboard id="d2-s4" label="04 · Scoreboard (TV)" width={780} height={480}>
          <TourneyLeaderboard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="d3-lab"
        title="03 · Lab Notebook"
        subtitle="Graph paper, monospace, dotted lines. Numbers as sample IDs."
      >
        <DCArtboard id="d3-meta" label="Direction" width={300} height={640}>
          <Direction3Meta />
        </DCArtboard>
        <DCArtboard id="d3-s1" label="01 · Subject intake" width={340} height={660}>
          <LabLanding />
        </DCArtboard>
        <DCArtboard id="d3-s2" label="02 · Sample assignment" width={340} height={660}>
          <LabReveal />
        </DCArtboard>
        <DCArtboard id="d3-s3" label="03 · Tasting panel" width={340} height={660}>
          <LabVote />
        </DCArtboard>
        <DCArtboard id="d3-s4" label="04 · Results (TV)" width={780} height={480}>
          <LabLeaderboard />
        </DCArtboard>
      </DCSection>

      <DCSection
        id="d4-party"
        title="04 · Party Banner"
        subtitle="Loud, joyful, balloons + confetti. Numbers on banners &amp; favor tags."
      >
        <DCArtboard id="d4-meta" label="Direction" width={300} height={640}>
          <Direction4Meta />
        </DCArtboard>
        <DCArtboard id="d4-s1" label="01 · Welcome" width={340} height={660}>
          <PartyLanding />
        </DCArtboard>
        <DCArtboard id="d4-s2" label="02 · Your flight" width={340} height={660}>
          <PartyReveal />
        </DCArtboard>
        <DCArtboard id="d4-s3" label="03 · Pick top 2" width={340} height={660}>
          <PartyVote />
        </DCArtboard>
        <DCArtboard id="d4-s4" label="04 · Live (TV)" width={780} height={480}>
          <PartyLeaderboard />
        </DCArtboard>
      </DCSection>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
