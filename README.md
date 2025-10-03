# Pet Registry 🐾

A comprehensive pet registration system built with Angular and .NET Core, designed to manage pet and owner information with a modern, multilingual interface.

## 🌐 Live Demo

**[Try the live demo on GitHub Pages](https://blockplocker.github.io/PetRegistry/)**

> **Note**: The demo uses local storage instead of the API backend, so you can explore all features without setting up the server infrastructure.

## 📋 Overview

Pet Registry is a full-stack web application that allows users to register, manage, and search for pets and their owners. The system provides a clean, intuitive interface with internationalization support for multiple languages.

## 🏗️ Architecture

This project consists of two main components:

### Frontend (Angular)
- **Framework**: Angular 20.x
- **Language**: TypeScript
- **Styling**: CSS with Angular CDK
- **Internationalization**: ngx-translate (English, German, Spanish, French, Swedish)
- **HTTP Client**: Auto-generated using NSwag
- **Demo Mode**: Local storage support for API-free demonstration (configured in environment files)

### Backend (ASP.NET Core API)
- **Framework**: .NET 8.0
- **Database**: SQL Server with Entity Framework Core
- **API Documentation**: Swagger/OpenAPI
- **Architecture**: RESTful API with service layer pattern

## 🚀 Features

- **Pet Management**: Register and manage pet information including:
  - Name, gender, species, breed
  - Date of birth, color
  - Microchip and neutering status
  - Registration date

- **Owner Management**: Handle owner information including:
  - Personal details (name, contact info)
  - Address information
  - Multiple pet ownership support

- **Search & Filter**: Advanced search capabilities for pets and owners
- **Multilingual Support**: Available in 5 languages
- **Responsive Design**: Mobile-friendly interface
- **REST API**: Full CRUD operations via RESTful endpoints
- **Demo Mode**: Local storage fallback configured in environment settings

## 🛠️ Technology Stack

### Frontend
- Angular 20.x
- TypeScript
- Angular Material/CDK
- ngx-translate
- RxJS
- NSwag (API client generation)

### Backend
- ASP.NET Core 8.0
- Entity Framework Core 9.0
- SQL Server
- Swagger/OpenAPI
- AutoMapper (via custom mappers)

## 📁 Project Structure

```
PetRegistry/
├── PetRegistry/                 # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/      # Reusable UI components
│   │   │   ├── domain/          # API client (auto-generated)
│   │   │   ├── home/            # Home page component
│   │   │   ├── persons/         # Person management
│   │   │   ├── person-details/  # Person details view
│   │   │   ├── pets/            # Pet management
│   │   │   ├── pet-details/     # Pet details view
│   │   │   ├── search/          # Search functionality
│   │   │   └── Services/        # Angular services
│   │   └── environments/        # Environment configurations
│   └── public/i18n/             # Translation files
│
└── PetRegistryAPI/              # .NET Core Backend
    └── PetRegistryAPI/
        ├── Controllers/         # API controllers
        ├── Data/               # Entity Framework context
        ├── Dto/                # Data transfer objects
        ├── Mappers/            # Object mapping
        ├── Models/             # Entity models
        ├── Services/           # Business logic layer
        └── Migrations/         # Database migrations
```

## 🚦 Getting Started

### Quick Demo (No Backend Required)

For a quick demonstration without setting up the backend:

1. **Visit the live demo**: [GitHub Pages Demo](https://blockplocker.github.io/PetRegistry/)
2. **Or run locally with local storage**:
   ```bash
   cd PetRegistry
   npm install
   npm start
   ```
   The app will use local storage based on the configuration in `src/environments/environment.ts`.

### Full Setup with Backend

#### Prerequisites

- **Node.js** (v18 or higher)
- **Angular CLI** (`npm install -g @angular/cli`)
- **.NET 8.0 SDK**
- **SQL Server** (LocalDB or full installation)

#### Backend Setup

1. **Navigate to the API directory**:
   ```bash
   cd PetRegistryAPI/PetRegistryAPI
   ```

2. **Configure the database connection**:
   - Copy `exampleappsettings.json` to `appsettings.json`
   - Update the connection string in `appsettings.json`

3. **Install dependencies and run migrations**:
   ```bash
   dotnet restore
   dotnet ef database update
   ```

4. **Start the API**:
   ```bash
   dotnet run
   ```

The API will be available at `https://localhost:7xxx` (check console output for exact port).

#### Frontend Setup

1. **Navigate to the Angular directory**:
   ```bash
   cd PetRegistry
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure API vs Local Storage**:
   - Update `src/environments/environment.ts` to configure:
     - `API_URL`: Your backend API URL
     - `useLocalStorage`: Set to `false` to use API, `true` for local storage

4. **Start the development server**:
   ```bash
   npm start
   ```

The application will be available at `http://localhost:4200`.

## 🗄️ Database Schema

### Person Entity
- Id, FirstName, LastName
- Address, City
- PhoneNumber, Email
- Pets (One-to-Many relationship)

### Pet Entity
- Id, Name, Gender, Species, Breed
- DateOfBirth, Color
- IsMicrochip, IsNeutered
- RegistrationDate, PersonId (Foreign Key)

## 🌐 API Endpoints

### Person Endpoints
- `GET /Person` - Get all persons
- `POST /Person` - Create new person
- `GET /Person/{id}` - Get person by ID
- `PUT /Person/{id}` - Update person
- `DELETE /Person/{id}` - Delete person

### Pet Endpoints
- `GET /Pet` - Get all pets
- `POST /Pet` - Create new pet
- `GET /Pet/{id}` - Get pet by ID
- `PUT /Pet/{id}` - Update pet
- `DELETE /Pet/{id}` - Delete pet

## 🌍 Internationalization

The application supports the following languages:
- English (en)
- German (de)
- Spanish (es)
- French (fr)
- Swedish (sv)

Translation files are located in `PetRegistry/public/i18n/`.

## 💾 Local Storage Configuration

The application's data storage mode is configured in the environment files:

- **Development**: `src/environments/environment.development.ts`
- **Production**: `src/environments/environment.ts`

```typescript
export const environment = {
  API_URL: 'https://localhost:44391',
  useLocalStorage: true, // Set to false to use API, true for local storage
};
```

When `useLocalStorage` is set to `true`, the application:
- Uses browser local storage for data persistence
- Provides full functionality without server setup
- Maintains data across browser sessions
- Perfect for demonstrations and development

## 📝 Development

### Code Generation
- API client is auto-generated using NSwag from the backend OpenAPI specification
- Located in `src/app/domain/client.ts`

### Running Tests
```bash
# Frontend tests
cd PetRegistry
npm test

# Backend tests (if available)
cd PetRegistryAPI
dotnet test
```

### Building for Production
```bash
# Frontend
cd PetRegistry
npm run build

# Backend
cd PetRegistryAPI/PetRegistryAPI
dotnet publish -c Release
```

## 🚀 Deployment

### GitHub Pages
The frontend can be deployed to GitHub Pages. **Note**: GitHub Pages deployment is not automatic and requires manual deployment.

To deploy to GitHub Pages:
1. Build the project: `ng build`
2. Deploy using angular-cli-ghpages: `ng deploy`

The deployment includes:
- Optimized production build
- Local storage configuration for demo purposes
- All internationalization assets

### Backend Deployment
The .NET Core API can be deployed to:
- Azure App Service
- IIS
- Docker containers
- Any hosting provider supporting .NET 8.0

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

For support or questions, please open an issue in the GitHub repository.

---

*Made with ❤️ for pet lovers everywhere*