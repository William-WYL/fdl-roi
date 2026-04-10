import { useState } from "react";

export default function Benefits() {
  const [expanded, setExpanded] = useState({});

  const benefits = [
    {
      category: "Core LED Advantages",
      items: [
        {
          id: "efficiency",
          title: "Superior Efficiency",
          description:
            "LEDs are the most efficient light source available, offering up to 80–90% energy savings compared to incandescent bulbs.",
        },
        {
          id: "color",
          title: "Excellent Color Rendering",
          description:
            "Available in all shades of white—from warm to cool—providing high-quality visual performance in different environments with color rendering index (CRI) often exceeding 90.",
        },
        {
          id: "lifetime",
          title: "Extreme Lifetime (50,000 Hours)",
          description:
            "LEDs last 5–10 times longer than halogen lamps, resulting in low maintenance costs and hassle-free lighting. Typically longer than traditional incandescent or fluorescent systems.",
        },
        {
          id: "directional",
          title: "Directional Light Technology",
          description:
            "LEDs are very small and provide directional light, enabling precise optical systems that deliver light exactly where needed with minimal waste.",
        },
      ],
    },
    {
      category: "Sustainability & Safety",
      items: [
        {
          id: "environment",
          title: "Environmental Safety",
          description:
            "Unlike fluorescent lamps (which contain mercury and require special handling), LEDs are safe for the environment and require no special disposal procedures.",
        },
        {
          id: "safety",
          title: "Safety & Easy Operation",
          description:
            "Instant-on operation, low voltage, no start/reset time required, and no harmful UV emissions. LEDs are safe and easy to work with.",
        },
        {
          id: "heat",
          title: "Low Heat Emission",
          description:
            "The light beam is cool, making LEDs ideal for food displays, museums, and temperature-sensitive environments.",
        },
      ],
    },
    {
      category: "Design & Application Advantages",
      items: [
        {
          id: "design",
          title: "New Design Possibilities",
          description:
            "Extremely small form factor allows elegant integration into furniture, displays, and architectural elements previously impossible with traditional lighting.",
        },
        {
          id: "durability",
          title: "Robust & Shock-Resistant",
          description:
            "Solid-state lighting design makes LEDs resistant to shocks and vibrations—widely used in traffic lights and refrigerated displays in supermarkets.",
        },
        {
          id: "cold",
          title: "Excellent Cold Temperature Performance",
          description:
            "LEDs work better in cold environments; the colder the setting, the higher the efficacy—ideal for outdoor and freezer applications.",
        },
      ],
    },
    {
      category: "Light Quality & Control",
      items: [
        {
          id: "dimming",
          title: "Smooth Dimming Without Color Shift",
          description:
            "LEDs can be dimmed easily while maintaining stable color temperature—unlike incandescent lights that warm up when dimmed. Dimming also saves additional energy.",
        },
        {
          id: "tunable",
          title: "Tunable White LEDs",
          description:
            "Adjust color temperature independently from light intensity, enabling dynamic lighting that adapts to time of day and user preferences.",
        },
        {
          id: "spectrum",
          title: "Full Color Spectrum Control",
          description:
            "LEDs can generate white light in all shades plus a full spectrum of saturated colors. RGB combinations produce millions of colors without inefficient filters.",
        },
        {
          id: "digital",
          title: "Digital Control & Flexibility",
          description:
            "LED systems are fully digital-controllable, making them perfect for both functional lighting and decorative applications with smart automation.",
        },
      ],
    },
    {
      category: "Industry Performance Metrics",
      items: [
        {
          id: "savings",
          title: "Energy Savings: 80–90%",
          description:
            "Compared to incandescent lamps, LEDs achieve 80–90% energy reduction while providing superior light quality and lifespan.",
        },
        {
          id: "lifespan-compare",
          title: "5–10x Longer Than Halogen",
          description:
            "LEDs typically outlast halogen lamps by 5–10 times, translating to fewer replacements and reduced maintenance interventions.",
        },
        {
          id: "maintenance",
          title: "Maintenance Cost Reduction: 30–70%",
          description:
            "Commercial applications see maintenance cost reductions of 30–70% due to extended lifespan and reliability.",
        },
      ],
    },
  ];

  const toggleExpanded = (id) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>LED Lighting Benefits</h1>
        <p>
          Complete technical overview of LED advantages—click to explore each
          benefit.
        </p>
      </div>

      <div className="benefits-accordion">
        {benefits.map((section, sectionIdx) => (
          <div key={sectionIdx} className="benefits-section">
            <h2 className="section-title">{section.category}</h2>
            <div className="benefits-cards">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="benefit-card-foldable"
                  onClick={() => toggleExpanded(item.id)}
                >
                  <div className="benefit-card-header">
                    <h3>{item.title}</h3>
                    <span className="fold-icon">
                      {expanded[item.id] ? "▼" : "▶"}
                    </span>
                  </div>
                  {expanded[item.id] && (
                    <div className="benefit-card-content">
                      <p>{item.description}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
