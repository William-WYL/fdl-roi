export default function Benefits() {
  const benefits = [
    {
      icon: "💰",
      title: "Cost Savings",
      description:
        "Reduce energy consumption by up to 80% compared to traditional lighting.",
    },
    {
      icon: "🌍",
      title: "Environmentally Friendly",
      description: "Lower carbon footprint and reduced environmental impact.",
    },
    {
      icon: "⚡",
      title: "Longer Lifespan",
      description: "LED bulbs last 25-50 times longer than incandescent bulbs.",
    },
    {
      icon: "🎨",
      title: "Better Light Quality",
      description:
        "Instant on/off capability and no flickering for superior light quality.",
    },
    {
      icon: "🔧",
      title: "Easy Installation",
      description: "Compatible with existing fixtures and simple to install.",
    },
    {
      icon: "💡",
      title: "Various Options",
      description:
        "Available in multiple colors, brightness levels, and styles.",
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>LED Lighting Benefits</h1>
        <p>
          Discover the advantages of switching to LED technology for your
          lighting needs.
        </p>
      </div>

      <div className="benefits-grid">
        {benefits.map((benefit, idx) => (
          <div key={idx} className="benefit-card">
            <h3>
              {benefit.icon} {benefit.title}
            </h3>
            <p>{benefit.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
