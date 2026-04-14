export default function Banner() {
  return (
    <div
      style={{
        height: "300px",
        backgroundImage: "url('./public/images/banner.png')",
        backgroundSize: "cover",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
      }}
    ></div>
  );
}
