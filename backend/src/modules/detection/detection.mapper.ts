import { RawDetectionResult } from '../../core/providers/detection';
import { DetectionResultDto, RecommendationDto } from './detection.types';
import { AnimalType, RiskLevel } from '../../core/enums';

export class DetectionMapper {
  static toDetectionResultDto(raw: RawDetectionResult): DetectionResultDto {
    return {
      animal: raw.animalType,
      confidence: raw.confidence,
      boundingBox: raw.boundingBox,
      risk: raw.riskLevel,
      recommendations: this.generateRecommendations(raw.animalType, raw.riskLevel),
    };
  }

  private static generateRecommendations(animal: AnimalType, risk: RiskLevel): RecommendationDto[] {
    const recommendations: RecommendationDto[] = [];
    
    // Core priority actions based on Risk
    if (risk === RiskLevel.CRITICAL) {
      recommendations.push({ action: 'Trigger immediate high-decibel siren deterrent', priority: 'High' });
      recommendations.push({ action: 'Activate high-intensity strobe lights', priority: 'High' });
      recommendations.push({ action: 'Notify local authorities/forest department', priority: 'Medium' });
    }

    // Animal specific plans
    if (animal === AnimalType.ELEPHANT) {
      recommendations.push({ action: 'Play bee buzzing sounds via speakers', priority: 'High' });
      recommendations.push({ action: 'Alert neighboring farms in 5km radius', priority: 'High' });
      recommendations.push({ action: 'Log incident in Elephant corridor tracker', priority: 'Low' });
    } else if (animal === AnimalType.BOAR) {
      recommendations.push({ action: 'Activate ultrasonic ground repellents', priority: 'Medium' });
      recommendations.push({ action: 'Deploy chemical deterrent sprayers', priority: 'Medium' });
      recommendations.push({ action: 'Verify fencing integrity in sector', priority: 'High' });
    } else if (animal === AnimalType.MONKEY) {
      recommendations.push({ action: 'Deploy automated drone patrol', priority: 'Medium' });
      recommendations.push({ action: 'Play predator sounds (leopard/dog)', priority: 'Medium' });
      recommendations.push({ action: 'Trigger canopy sprinklers', priority: 'Low' });
    } else if (animal === AnimalType.BUFFALO || animal === AnimalType.COW || animal === AnimalType.NILGAI) {
      recommendations.push({ action: 'Deploy bright flashes to disorient', priority: 'High' });
      recommendations.push({ action: 'Activate loud mechanical clattering sounds', priority: 'Medium' });
      recommendations.push({ action: 'Dispatch farm personnel to perimeter', priority: 'High' });
    } else {
      recommendations.push({ action: 'Initiate general threat deterrent protocol', priority: 'Medium' });
      recommendations.push({ action: 'Save image for manual AI re-training', priority: 'Low' });
    }

    if (risk !== RiskLevel.CRITICAL) {
      recommendations.push({ action: 'Continue active monitoring', priority: 'Low' });
    }

    // Return up to 6 distinct plans
    return recommendations.slice(0, 6);
  }
}
