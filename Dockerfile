# Stage 1: Build the application with Maven & JDK 21
FROM maven:3.9.9-eclipse-temurin-21-alpine AS builder
WORKDIR /app

# Copy POM and source code
COPY pom.xml .
COPY src ./src

# Package the application JAR without running unit tests
RUN mvn clean package -DskipTests

# Stage 2: Lightweight runtime image with JRE 21
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

# Copy the built jar from the builder stage
COPY --from=builder /app/target/*.jar app.jar

# Expose Spring Boot's default HTTP port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
