
-- Enable Row Level Security
ALTER TABLE IF EXISTS modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS technologies ENABLE ROW LEVEL SECURITY;

-- Create modules table
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  clearance_level TEXT CHECK (clearance_level IN ('DELTA', 'GAMMA', 'BETA', 'ALPHA')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  year INTEGER,
  director TEXT,
  rating DECIMAL(3,1),
  synopsis TEXT,
  clearance_level TEXT CHECK (clearance_level IN ('DELTA', 'GAMMA', 'BETA', 'ALPHA')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create characters table
CREATE TABLE IF NOT EXISTS characters (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  alias TEXT,
  description TEXT,
  clearance_level TEXT CHECK (clearance_level IN ('DELTA', 'GAMMA', 'BETA', 'ALPHA')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create locations table
CREATE TABLE IF NOT EXISTS locations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  coordinates TEXT,
  clearance_level TEXT CHECK (clearance_level IN ('DELTA', 'GAMMA', 'BETA', 'ALPHA')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create technologies table
CREATE TABLE IF NOT EXISTS technologies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  specifications TEXT,
  clearance_level TEXT CHECK (clearance_level IN ('DELTA', 'GAMMA', 'BETA', 'ALPHA')) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample data
INSERT INTO modules (name, description, clearance_level) VALUES
('Surveillance Grid', 'City-wide monitoring system', 'GAMMA'),
('Combat Analysis', 'Tactical combat assessment tools', 'BETA'),
('Identity Database', 'Civilian and criminal identity records', 'ALPHA'),
('Vehicle Diagnostics', 'Batmobile and Batwing systems', 'DELTA');

INSERT INTO movies (title, year, director, rating, synopsis, clearance_level) VALUES
('Batman Begins', 2005, 'Christopher Nolan', 8.2, 'Bruce Wayne begins his journey as Batman', 'DELTA'),
('The Dark Knight', 2008, 'Christopher Nolan', 9.0, 'Batman faces the Joker in Gotham City', 'GAMMA'),
('The Dark Knight Rises', 2012, 'Christopher Nolan', 8.4, 'Batman returns to save Gotham from Bane', 'BETA'),
('Justice League', 2017, 'Zack Snyder', 6.2, 'Batman assembles the Justice League', 'ALPHA');

INSERT INTO characters (name, alias, description, clearance_level) VALUES
('Bruce Wayne', 'Batman', 'Billionaire vigilante protecting Gotham', 'ALPHA'),
('Alfred Pennyworth', 'Alfred', 'Wayne family butler and confidant', 'BETA'),
('Commissioner Gordon', 'Gordon', 'Gotham Police Commissioner', 'GAMMA'),
('Selina Kyle', 'Catwoman', 'Master thief and occasional ally', 'DELTA');

INSERT INTO locations (name, description, coordinates, clearance_level) VALUES
('Wayne Manor', 'Bruce Wayne''s ancestral home', '40.7589, -73.9851', 'BETA'),
('Batcave', 'Secret headquarters beneath Wayne Manor', 'CLASSIFIED', 'ALPHA'),
('Gotham City Hall', 'Municipal government building', '40.7505, -73.9934', 'DELTA'),
('Ace Chemicals', 'Industrial facility where Joker was created', '40.7282, -74.0776', 'GAMMA');

INSERT INTO technologies (name, description, specifications, clearance_level) VALUES
('Batcomputer', 'Advanced quantum computing system', 'Quantum processors, AI-assisted analysis', 'ALPHA'),
('Grappling Gun', 'Portable ascension device', 'Range: 300ft, Weight capacity: 350lbs', 'GAMMA'),
('Utility Belt', 'Multi-purpose equipment storage', 'Titanium construction, 20 compartments', 'DELTA'),
('Batmobile', 'Armored pursuit vehicle', 'V12 engine, 0-60 in 2.8s, Level 5 armor', 'BETA');
