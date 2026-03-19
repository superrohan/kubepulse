# Build stage
FROM maven:3.9.6-eclipse-temurin-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

# Runtime stage
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Create non-root user for security
RUN groupadd -r kubepulse && useradd -r -g kubepulse kubepulse

COPY --from=builder /app/target/kubepulse-backend-*.jar app.jar
RUN chown kubepulse:kubepulse app.jar

USER kubepulse

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:+UseG1GC", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-jar", "app.jar"]
