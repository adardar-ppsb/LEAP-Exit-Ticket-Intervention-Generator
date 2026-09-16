export interface CurriculumStructure {
  [subject: string]: {
    name: string;
    grades: {
      [grade: string]: {
        [module: string]: {
          lessons: string[];
        };
      };
    };
  };
}

export const CURRICULUM_MAP: CurriculumStructure = {
  ELA: {
    name: "Wit & Wisdom",
    grades: {
      "Grade 2": {
        "Module 1: Weather": {
          lessons: [
            "Lesson 1-5: Weather Poem & Rainy Day Art Analysis",
            "Lesson 6-12: Sky Observations & Autumn Landscape",
            "Lesson 13-18: Wind Dynamics & Seasonal Changes"
          ]
        },
        "Module 2: The American West": {
          lessons: [
            "Lesson 1-5: The Buffalo Are Back & Indigenous Plains Cultures",
            "Lesson 6-12: Legend of the Bluebonnet & Droughts",
            "Lesson 13-20: Johnny Appleseed, John Henry & Pioneer Journeys"
          ]
        },
        "Module 3: Civil Rights Heroes": {
          lessons: [
            "Lesson 1-5: Ruby Bridges Goes to School (My True Story)",
            "Lesson 6-12: Martin Lincoln Jr. & The March on Washington",
            "Lesson 13-18: Equal Rights and the Civil Rights Act of 1964"
          ]
        },
        "Module 4: Good Enough to Eat": {
          lessons: [
            "Lesson 1-5: The Digestive System & Nourishment (Good Enough to Eat)",
            "Lesson 6-12: MyPlate Food Groups & Shared Research Tasks",
            "Lesson 13-18: Healthy Cooking and Lifestyles"
          ]
        }
      },
      "Grade 3": {
        "Module 1: The Sea": {
          lessons: [
            "Lesson 1-5: Ocean Giant Discoveries & Amos and Boris",
            "Lesson 6-12: Giant Squid Adaptations & Marine Deep Dive",
            "Lesson 13-18: Marine Conservation & Socratic Sea Seminars"
          ]
        },
        "Module 2: Outer Space (Starry Messenger & Moonshot)": {
          lessons: [
            "Lesson 1-10: Galileo's Starry Messenger, Observations, & Using Adjectives",
            "Lesson 11-20: Moonshot Flight of Apollo 11 & Explaining Scientific Thinking",
            "Lesson 21-35: Zathura, Space Object Models & Crafting Opinions with Evidence"
          ]
        },
        "Module 3: Immigrant Stories": {
          lessons: [
            "Lesson 1-5: Grandfather's Journey & Cultural New Horizons",
            "Lesson 6-12: Tea with Milk, Kyoto to Kyoto & Cultural Bridges",
            "Lesson 13-18: Coming to America, The Keeping Quilt & Heritage Preservation"
          ]
        },
        "Module 4: Artists & Inspiration": {
          lessons: [
            "Lesson 1-5: Emma's Rug & Finding Artistic Inspiration",
            "Lesson 6-12: Starry Night, Vincent Van Gogh & Creative Explanatory Essays",
            "Lesson 13-18: Sculpture Masterpieces & Public Community Artworks"
          ]
        }
      },
      "Grade 4": {
        "Module 1: A Great Heart": {
          lessons: [
            "Lesson 1-5: Figurative vs Literal Heart & Clara Barton Biographies",
            "Lesson 6-12: Helen Keller & Anne Frank Life Perspectives",
            "Lesson 13-18: The Circulatory Story & Love That Dog Literary Synthesis"
          ]
        },
        "Module 2: Extreme Settings & Survival": {
          lessons: [
            "Lesson 1-5: All Summer in a Day (Venusian Climate Sensory Details)",
            "Lesson 6-12: Hatchet by Gary Paulsen (Wilderness Survival Dynamics)",
            "Lesson 13-20: Fallingwater Architecture, SAS Survival & Theme Construction"
          ]
        },
        "Module 3: The American Revolution": {
          lessons: [
            "Lesson 1-5: George vs. George Perspectives (Patriots vs. Loyalists)",
            "Lesson 6-12: Taxation Without Representation & Critical Incidents",
            "Lesson 13-20: Declarations of Independence & Justification Essays"
          ]
        },
        "Module 4: Myths & Legends": {
          lessons: [
            "Lesson 1-5: Ancient Greek Mythology, Gifts from the Gods & Achilles' Heel",
            "Lesson 6-12: Roman Myths, Underworld Narratives & Vocabulary Expansion",
            "Lesson 13-18: Cultural Legends, Storytelling Roles & Modern Vocabulary Connections"
          ]
        }
      }
    }
  },
  Math: {
    name: "Eureka Math²",
    grades: {
      "Grade 2": {
        "Module 1: Place Value Concepts / Metric Measurement / Data": {
          lessons: [
            "Topic A Lesson 1-4: Draw Picture & Bar Graphs to Represent Data",
            "Topic B Lesson 5-7: Iterate Centimeter Cubes & Make 10 cm Ruler",
            "Topic C Lesson 8-10: Make a Meter Stick & Relate Units (1cm, 10cm, 100cm)",
            "Topic G Lesson 21-27: Expanded, Unit, & Word Forms to 1,000"
          ]
        },
        "Module 2: Addition and Subtraction Within 200": {
          lessons: [
            "Topic A Lesson 1-5: Add Like Units, Compensation & Make a Ten",
            "Topic B Lesson 6-11: Subtraction Decomposing to Simplify Problems",
            "Topic C Lesson 12-16: Two-step Word Problems with Tape Diagrams"
          ]
        },
        "Module 3: Shapes and Time with Fraction Concepts": {
          lessons: [
            "Topic A Lesson 1-4: Classify Polygons by Sides, Vertex & Angles",
            "Topic B Lesson 5-9: Partition Rectangles & Halves, Thirds, Fourths",
            "Topic C Lesson 10-14: Tell Time to Nearest 5 Minutes (a.m. / p.m.)"
          ]
        },
        "Module 4: Addition and Subtraction Within 1,000": {
          lessons: [
            "Topic A Lesson 1-5: Mental Math Place Value (Add/Sub Tens & Hundreds)",
            "Topic B Lesson 6-12: Three-digit Addition Composing Units",
            "Topic C Lesson 13-18: Three-digit Subtraction Decomposing Units",
            "Topic D Lesson 19-24: Read-Draw-Write Problem Solving"
          ]
        },
        "Module 5: Money, Data, and Customary Measurement": {
          lessons: [
            "Topic A Lesson 1-4: Problem Solving with Coins, Bills & Fewest Coins",
            "Topic B Lesson 5-8: Measure Inches/Feet & Compare Customary Lengths",
            "Topic C Lesson 9-12: Generate Measurement Data & Draw Line Plots"
          ]
        },
        "Module 6: Multiplication and Division Foundations": {
          lessons: [
            "Topic A Lesson 1-4: Font count Equal Groups & Write Repeated Addition Equations",
            "Topic B Lesson 5-9: Array Columns and Rows & Partitioning Tiles",
            "Topic C Lesson 10-15: Even/Odd Numbers & Rectangular Arrays"
          ]
        }
      },
      "Grade 3": {
        "Module 1: Multiplication and Division with Units of 2, 3, 4, 5, and 10": {
          lessons: [
            "Topic A Lesson 1-4: Connecting Equal Groups and Repeated Addition to Multiplication",
            "Topic B Lesson 5-8: Division Interpretations (Measurement vs. Partitive)",
            "Topic C Lesson 9-12: Arrays, Area Models & Writing Equations with Unknowns",
            "Topic F Lesson 17-21: Commutative, Distributive, and Associative Properties"
          ]
        },
        "Module 2: Place Value Concepts Through Metric Measurement": {
          lessons: [
            "Topic A Lesson 1-5: Measuring Weight in Grams/Kilograms & Composing Units",
            "Topic B Lesson 6-10: Estimating & Measuring Liquid Volume in Liters/Milliliters",
            "Topic C Lesson 11-15: Number Line Rounding & Estimating Within 1,000",
            "Topic D Lesson 16-20: Addition & Subtraction Algorithms with Metric Contexts"
          ]
        },
        "Module 3: Multiplication and Division with Units of 0, 1, 6, 7, 8, and 9": {
          lessons: [
            "Topic A Lesson 1-5: Multiplication and Division with Emphasis on 6 and 8",
            "Topic B Lesson 6-12: Multiplying and Dividing by 9, 0, and 1",
            "Topic C Lesson 13-18: Multiples, Skip-Counting Patterns, and Distributive Property",
            "Topic D Lesson 19-24: Solving Multi-Step Word Problems with a Letter for Unknowns"
          ]
        },
        "Module 4: Multiplication and Area": {
          lessons: [
            "Topic A Lesson 1-4: Understanding Area as an Attribute & Tiling Polygons",
            "Topic B Lesson 5-9: Concepts of Area Measurement & Multiplying Side Lengths",
            "Topic C Lesson 10-14: Area of Composite Shapes & Distributive Property Partitioning",
            "Topic D Lesson 15-18: Area Models, Grid Drawings, and Representing Area on Line Plots"
          ]
        },
        "Module 5: Fractions as Numbers": {
          lessons: [
            "Topic A Lesson 1-6: Partitioning Wholes into Equal Shares & Unit Fractions",
            "Topic B Lesson 7-12: Constructing Non-Unit Fractions & Specifying the Whole",
            "Topic C Lesson 13-18: Plotting and Labelling Fractions on the Number Line",
            "Topic D Lesson 19-24: Identifying Equivalent Fractions & Visualizing Fraction Sizes"
          ]
        },
        "Module 6: Geometry, Measurement, and Data": {
          lessons: [
            "Topic A Lesson 1-5: Telling Time to the Nearest Minute & Solving Elapsed Time Intervals",
            "Topic B Lesson 6-10: Scaled Picture & Bar Graphs to Represent Categorical Data",
            "Topic C Lesson 11-15: Attributes of Polygons & Categorizing Quadrilaterals",
            "Topic D Lesson 16-20: Measuring to the Nearest Quarter Inch & Drawing Line Plots"
          ]
        }
      },
      "Grade 4": {
        "Module 1: Place Value Concepts for Addition and Subtraction": {
          lessons: [
            "Topic A Lesson 1-4: Multiplication as Multiplicative Comparison & Tape Diagrams",
            "Topic B Lesson 5-10: Place Value, Naming Units, and Comparison Within 1,000,000",
            "Topic C Lesson 11-16: Rounding Multi-Digit Numbers with Vertical Number Lines",
            "Topic D Lesson 17-22: Standard Multi-Digit Addition & Subtraction Algorithms",
            "Topic E Lesson 23-28: Conversions of Metric Units (km, m, kg, g, L, mL)"
          ]
        },
        "Module 2: Place Value Concepts for Multiplication and Division": {
          lessons: [
            "Topic A Lesson 1-5: Multiplying and Dividing Multiples of 10 by 1-Digit Numbers",
            "Topic B Lesson 6-12: Area Model & Perimeter of Rectangles with Formula Conversions",
            "Topic C Lesson 13-18: Area Model for Multi-Digit Factors and Partial Products",
            "Topic D Lesson 19-24: Division with Partial Quotients & Factors/Multiples within 100",
            "Topic E Lesson 25-28: Prime vs Composite Numbers & Ordered Terms in Patterns"
          ]
        },
        "Module 3: Multiplication and Division of Multi-Digit Numbers": {
          lessons: [
            "Topic A Lesson 1-6: Multiplying and Dividing Multiples of 10, 100, and 1,000",
            "Topic B Lesson 7-12: Area Model for Multi-Digit Factors and Partial Products",
            "Topic C Lesson 13-20: Customary Conversions (yd, ft, in, lb, oz, gal, qt)",
            "Topic D Lesson 21-26: Remainder Logic and Solving Multi-Step Real-World Problems"
          ]
        },
        "Module 4: Foundations for Fraction Operations": {
          lessons: [
            "Topic A Lesson 1-6: Decomposing Fractions into Sums of Smaller Units",
            "Topic B Lesson 7-12: Equivalence Using Multiplicative and Area Models",
            "Topic C Lesson 13-18: Renaming Fractions Greater than 1 as Mixed Numbers",
            "Topic D Lesson 19-25: Adding and Subtracting Fractions with Like Denominators",
            "Topic E Lesson 26-31: Line Plots with Fraction and Mixed Number Data"
          ]
        },
        "Module 5: Place Value Concepts for Decimal Fractions": {
          lessons: [
            "Topic A Lesson 1-5: Exploration of Tenths in Fraction and Decimal Forms",
            "Topic B Lesson 6-12: Tenths and Hundredths on Number Lines & Area Models",
            "Topic C Lesson 13-18: Decimal Money Applications & Decimals to Hundredths",
            "Topic D Lesson 19-24: Place Value Charts with Decimals & Fractional Addition"
          ]
        },
        "Module 6: Angle Measurements and Plane Figures": {
          lessons: [
            "Topic A Lesson 1-5: Defining Points, Lines, Rays, Segments, Perpendicular & Parallel Structures",
            "Topic B Lesson 6-12: Classifying and Estimating Angles Relative to Square Corners",
            "Topic C Lesson 13-18: Measuring and Constructing Angles with Protractors",
            "Topic D Lesson 19-24: Supplementary Angles and Triangles (Scalene, Isosceles, Right, Obtuse)"
          ]
        }
      }
    }
  },
  Science: {
    name: "Amplify Science",
    grades: {
      "Grade 3": {
        "Module 1: Balancing Forces (Floating Trains)": {
          lessons: [
            "Chapter 1: Balanced & Unbalanced Forces in Motion",
            "Chapter 2: Forces at a Distance (Magnetic Forces & Field Effects)",
            "Chapter 3: Gravity and Unseen Universal Pulls",
            "Chapter 4: Conceptualizing Inventions via Magnetic/Gravity Systems"
          ]
        },
        "Module 2: Environments and Survival (RoboGrazer & Snails)": {
          lessons: [
            "Chapter 1: Structure and Function Dynamics of Shell Variations",
            "Chapter 2: Predatory Selectivity and Survival Advantages",
            "Chapter 3: Snail Shell Coloration & Environmental Adaptation Pattern",
            "Chapter 4: RoboGrazer Biomimicry Designing Solutions"
          ]
        },
        "Module 3: Inheritance and Traits (Variation in Wolves)": {
          lessons: [
            "Chapter 1: Trait Variations and Visual Patterns in Wolves",
            "Chapter 2: Offspring Inheriting Genetic Blueprints from Parents",
            "Chapter 3: Environmental Factors Influencing Organism Development",
            "Chapter 4: Offspring Sparrow Traits and Genetic Possibilities"
          ]
        },
        "Module 4: Weather and Climate (Orangutan Reserve)": {
          lessons: [
            "Chapter 1: Measuring Precipitation & Temperature Averages",
            "Chapter 2: Weather vs Climate Zones Over Decadal Intervals",
            "Chapter 3: Determining Island Climates for Orangutan Habitation",
            "Chapter 4: Natural Hazards & Climate Impact Prevention Solutions"
          ]
        }
      },
      "Grade 4": {
        "Module 1: Energy Conversions (Blackout in Ergstown)": {
          lessons: [
            "Chapter 1 Lesson 1.1-1.3: Analyzing Blackouts & Input-Output Systems",
            "Topic B Lesson 2.1-2.4: Generators, Chemical Energy & Converters",
            "Topic C Lesson 3.1-3.4: Electrical Grid Overloads & System Optimization",
            "Topic D Lesson 4.1-4.6: Redesigning Electrical Grids & Mitigating System Failure"
          ]
        },
        "Module 2: Vision and Light (Investigating Animal Eyes)": {
          lessons: [
            "Chapter 1 Lesson 1.1-1.4: Sensory Receptors Sensitivity & Light Inputs",
            "Topic B Lesson 2.1-2.5: Light Transmission, Reflection, & Absorption",
            "Topic C Lesson 3.1-3.5: Pupil and Structure Adaptations in Predator/Prey",
            "Topic D Lesson 5.1-5.2: Neural System Processing & Survival Behaviors"
          ]
        },
        "Module 3: Earth's Features (Mystery in Desert Rocks Canyon)": {
          lessons: [
            "Chapter 1 Lesson 1.1-1.4: Sedimentary Rock Layers & Fossil Evidence",
            "Topic B Lesson 2.1-2.5: Running Water, Wind weathering & Erosion Speeds",
            "Topic C Lesson 3.1-3.4: Deep Time Records & Sedimentary Transformations",
            "Topic D Lesson 4.1-4.5: Canyon Fossil Chronology & Deep Time Reconstruction"
          ]
        },
        "Module 4: Waves, Energy, and Information (Dolphin Communication)": {
          lessons: [
            "Chapter 1 Lesson 1.1-1.3: Waves and Sound (Frequency, Amplitude, & Pitch)",
            "Topic B Lesson 2.1-2.4: Wave Particle Collisions & Propagation Mediums",
            "Topic C Lesson 3.1-3.5: Dolphins Encoding Information & Sonic Wave Modulation",
            "Topic D Lesson 4.1-4.4: Visualizing Wave Patterns & Digital Signal Transfer"
          ]
        }
      }
    }
  }
};
